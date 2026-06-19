import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export const useCreateAccount = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<any[]>([]);

  // Estado para controlar si el usuario quiere unirse o crear una empresa
  const [isCrearEmpresa, setIsCrearEmpresa] = useState(false);

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

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    api.get('/api/auth/empresas-publicas/')
      .then((res: any) => {
        const listaEmpresas = res?.data?.detalle || res?.detalle || [];
        setEmpresas(listaEmpresas);
      })
      .catch((err) => console.error("Error cargando empresas:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones extra dependiendo del modo elegido
    if (isCrearEmpresa && (!formData.nombreEmpresa || !formData.rucEmpresa)) {
      alert("Por favor ingrese el nombre y RUC de su nueva empresa.");
      return;
    }
    if (!isCrearEmpresa && !formData.codigoEmpresa) {
      alert("Por favor seleccione una empresa para unirse.");
      return;
    }

    const payload = {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      cedula: formData.identificacion,
      correo: formData.correo,
      password: formData.password,
      isCrearEmpresa: isCrearEmpresa,           // Flag (bandera) para el backend
      codigoEmpresa: formData.codigoEmpresa,    // Solo viaja si se une
      nombreEmpresa: formData.nombreEmpresa,    // Solo viaja si crea
      rucEmpresa: formData.rucEmpresa           // Solo viaja si crea
    };

    api.post('/api/auth/registerAccount/', payload)
      .then((res) => {
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 1500);
      })
      .catch((err) => {
        alert(err?.response?.data?.detalle || err?.response?.mensaje || 'Error registrando usuario');
      });
  };

  return {
    formData,
    empresas,
    isSuccess,
    isCrearEmpresa, 
    setIsCrearEmpresa, // Exponemos esto para los botones
    handleChange,
    handleSubmit
  };
};