import { useState, useEffect } from 'react';
import type { Empresa } from '../interface/Empresa';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

// ==========================================================
// ALGORITMOS DE VALIDACIÓN ECUATORIANA (CÉDULA Y RUC)
// ==========================================================
const validarCedula = (cedula: string): boolean => {
  if (cedula.length !== 10) return false;
  
  const prov = parseInt(cedula.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;

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
  if (parseInt(ruc.substring(10, 13), 10) < 1) return false; // Debe terminar en algo mayor a 000

  const prov = parseInt(ruc.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(ruc[2], 10);

  if (tercerDigito < 6) {
    // Persona Natural: Los primeros 10 dígitos son la cédula
    return validarCedula(ruc.substring(0, 10));
  } 
  else if (tercerDigito === 6) {
    // Entidad Pública
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) suma += parseInt(ruc[i], 10) * coeficientes[i];
    const digitoVerificador = parseInt(ruc[8], 10);
    const residuo = suma % 11;
    let resultado = residuo === 0 ? 0 : 11 - residuo;
    return resultado === digitoVerificador;
  } 
  else if (tercerDigito === 9) {
    // Sociedad Privada
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


export const useEmpresas = () => {
  const { showToast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/gestionEmpresas/empresas/');
      const data = res?.detalle || res || [];
      setEmpresas(data);
    } catch (error) {
      console.error("Error al cargar las empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const handleEditClick = (empresa: Empresa) => {
    setSelectedEmpresa({ ...empresa });
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setSelectedEmpresa(null);
  };

  // ==========================================================
  // BLOQUEO EN TIEMPO REAL (Evitar letras en RUC)
  // ==========================================================
  const updateEditEmpresaField = (field: keyof Empresa, value: any) => {
    if (!selectedEmpresa) return;
    let finalValue = value;
    
    if (field === 'ruc') {
      finalValue = String(value).replace(/\D/g, ''); // Eliminar todo lo que no sea número
      if (finalValue.length > 13) finalValue = finalValue.slice(0, 13); // Máximo 13 dígitos
    }
    
    setSelectedEmpresa({ ...selectedEmpresa, [field]: finalValue });
  };

  const handleSaveEmpresa = async () => {
    if (!selectedEmpresa) return;

    // VALIDACIÓN ESTRICTA DEL RUC ANTES DE ENVIAR A LA BASE DE DATOS
    if (!selectedEmpresa.ruc || !validarRuc(selectedEmpresa.ruc)) {
      showToast("El RUC ingresado no es válido según las normativas ecuatorianas. Verifique que tenga 13 dígitos y sea correcto.", "error");
      return;
    }

    try {
      await api.patch(`/api/gestionEmpresas/empresas/${selectedEmpresa.codigoEmpresa}/`, {
        nombreEmpresa: selectedEmpresa.nombreEmpresa,
        ruc: selectedEmpresa.ruc,
        direccion: selectedEmpresa.direccion
      });
      closeModals();
      loadEmpresas();
      showToast("Datos de la empresa actualizados exitosamente.", "success");
    } catch (error: any) {
      showToast(error?.response?.mensaje || 'Error al actualizar la empresa.', 'error');
    }
  };

  return {
    empresas, loading,
    isEditModalOpen,
    selectedEmpresa, 
    updateEditEmpresaField, // Exponemos la nueva función al componente
    handleEditClick,
    closeModals, handleSaveEmpresa
  };
};