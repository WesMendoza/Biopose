import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

// ==========================================================
// ALGORITMOS DE VALIDACIÓN ECUATORIANA
// ==========================================================
const validarCedula = (cedula: string): boolean => {
  if (cedula.length !== 10) return false;
  
  const prov = parseInt(cedula.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false; // 30 es para ecuatorianos en el exterior

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false; // El tercer dígito para personas naturales es menor a 6

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula[9], 10);
  let decenaSuperior = Math.ceil(suma / 10) * 10;
  let resultado = decenaSuperior - suma;
  if (resultado === 10) resultado = 0;

  return resultado === digitoVerificador;
};

const validarRuc = (ruc: string): boolean => {
  if (ruc.length !== 13) return false;
  if (parseInt(ruc.substring(10, 13), 10) < 1) return false; // Debe terminar en algo mayor a 000 (usualmente 001)

  const prov = parseInt(ruc.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(ruc[2], 10);

  if (tercerDigito < 6) {
    // Persona Natural: Los primeros 10 dígitos son la cédula
    return validarCedula(ruc.substring(0, 10));
  } 
  else if (tercerDigito === 6) {
    // Entidad Pública: Módulo 11 (coeficientes específicos)
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) suma += parseInt(ruc[i], 10) * coeficientes[i];
    const digitoVerificador = parseInt(ruc[8], 10);
    const residuo = suma % 11;
    let resultado = residuo === 0 ? 0 : 11 - residuo;
    return resultado === digitoVerificador;
  } 
  else if (tercerDigito === 9) {
    // Sociedad Privada: Módulo 11 (coeficientes específicos)
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) suma += parseInt(ruc[i], 10) * coeficientes[i];
    const digitoVerificador = parseInt(ruc[9], 10);
    const residuo = suma % 11;
    let resultado = residuo === 0 ? 0 : 11 - residuo;
    return resultado === digitoVerificador;
  }

  return false;
};

export const useCreateAccount = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [isCrearEmpresa, setIsCrearEmpresa] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    password: '',
    codigoEmpresa: '',
    nombreEmpresa: '',
    rucEmpresa: '',
  });

  useEffect(() => {
    api.get('/api/auth/empresas-publicas/')
      .then((res: any) => {
        const listaEmpresas = res?.data?.detalle || res?.detalle || [];
        setEmpresas(listaEmpresas);
      })
      .catch((err) => console.error("Error cargando empresas:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // BLOQUEO: Evitar que escriban letras en campos estrictamente numéricos
    if (['identificacion', 'celular', 'rucEmpresa'].includes(name)) {
      finalValue = value.replace(/\D/g, ''); // \D significa "todo lo que no sea dígito"
      
      // Limitar longitudes máximas
      if (name === 'identificacion' && finalValue.length > 10) finalValue = finalValue.slice(0, 10);
      if (name === 'celular' && finalValue.length > 10) finalValue = finalValue.slice(0, 10);
      if (name === 'rucEmpresa' && finalValue.length > 13) finalValue = finalValue.slice(0, 13);
    }

    setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validar Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      showToast("El formato del correo electrónico no es válido. Asegúrate de incluir un símbolo '@' y un dominio válido (ej. usuario@empresa.com).", "warning");
      return;
    }

    // 2. Validar Cédula Ecuatoriana
    if (!validarCedula(formData.identificacion)) {
      showToast("La cédula ingresada no es válida. Revise los números ingresados.", "error");
      return;
    }

    // 3. Validar Celular (10 dígitos, empieza con 09)
    if (formData.celular.length !== 10 || !formData.celular.startsWith('09')) {
      showToast("El número de celular debe tener 10 dígitos y empezar con '09'.", "warning");
      return;
    }

    // 4. Validar Empresa / RUC
    if (isCrearEmpresa) {
      if (!formData.nombreEmpresa || !formData.rucEmpresa) {
        showToast("Para registrar una nueva empresa, es obligatorio proporcionar tanto el Nombre Comercial como el número de RUC.", "warning");
        return;
      }
      if (!validarRuc(formData.rucEmpresa)) {
        showToast("El RUC ingresado no es válido según los estándares ecuatorianos (Natural, Pública o Privada).", "error");
        return;
      }
    } else {
      if (!formData.codigoEmpresa) {
        showToast("Por favor seleccione una empresa para unirse.", "warning");
        return;
      }
    }

    const payload = {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      cedula: formData.identificacion,
      correo: formData.correo,
      password: formData.password,
      isCrearEmpresa: isCrearEmpresa,           
      codigoEmpresa: formData.codigoEmpresa,    
      nombreEmpresa: formData.nombreEmpresa,    
      rucEmpresa: formData.rucEmpresa           
    };

    api.post('/api/auth/registerAccount/', payload)
      .then(() => {
        setIsSuccess(true);
        showToast("Cuenta registrada exitosamente. Serás redirigido al inicio de sesión.", "success");
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((err) => {
        showToast(err?.response?.data?.detalle || err?.response?.mensaje || 'Error registrando usuario. Intenta nuevamente.', 'error');
      });
  };

  return {
    formData, empresas, isSuccess, isCrearEmpresa, setIsCrearEmpresa, handleChange, handleSubmit
  };
};