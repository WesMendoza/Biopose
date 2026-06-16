import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTAMOS EL DECODIFICADOR

export interface Empresa {
  idEmpresa?: number;
  codigoEmpresa?: string;
  nombreEmpresa: string;
  ruc: string;
  direccion?: string;
  estado?: string;
}

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [nuevaEmpresa, setNuevaEmpresa] = useState<Empresa>({ nombreEmpresa: '', ruc: '', direccion: '' });

  // 1. EXTRAER LA EMPRESA DEL USUARIO LOGGEADO
  const getEmpresaId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.idEmpresa;
    } catch {
      return null;
    }
  };
  const idEmpresa = getEmpresaId();

  // 2. CARGAR EMPRESA FILTRADA
  const fetchEmpresas = useCallback(async () => {
    if (!idEmpresa) return; // Si no hay token, no cargamos nada
    
    setLoading(true);
    try {
      // Le avisamos a Django qué empresa queremos ver
      const res = await api.get(`/api/gestionEmpresas/empresas/?idEmpresa=${idEmpresa}`);
      setEmpresas(res?.detalle || res || []);
    } catch (error) {
      console.error("Error cargando empresas", error);
    } finally {
      setLoading(false);
    }
  }, [idEmpresa]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleCreateClick = () => {
    setNuevaEmpresa({ nombreEmpresa: '', ruc: '', direccion: '' });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (empresa: Empresa) => {
    setSelectedEmpresa({ ...empresa });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedEmpresa(null);
  };

  const handleCreateEmpresa = async () => {
    try {
      await api.post('/api/gestionEmpresas/empresas/', {
        nombreEmpresa: nuevaEmpresa.nombreEmpresa,
        ruc: nuevaEmpresa.ruc,
        direccion: nuevaEmpresa.direccion
      });
      await fetchEmpresas();
      closeModals();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando la empresa');
    }
  };

  const handleSaveEmpresa = async () => {
    if (selectedEmpresa?.codigoEmpresa) {
      try {
        await api.patch(`/api/gestionEmpresas/empresas/${selectedEmpresa.codigoEmpresa}/`, selectedEmpresa);
        await fetchEmpresas();
        closeModals();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando la empresa');
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedEmpresa?.codigoEmpresa) {
      try {
        await api.del(`/api/gestionEmpresas/empresas/${selectedEmpresa.codigoEmpresa}/`);
        setEmpresas(empresas.filter(e => e.codigoEmpresa !== selectedEmpresa.codigoEmpresa));
        closeModals();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error eliminando la empresa');
      }
    }
  };

  return {
    empresas, loading,
    isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedEmpresa, setSelectedEmpresa,
    nuevaEmpresa, setNuevaEmpresa,
    handleCreateClick, handleEditClick, handleDeleteClick,
    closeModals,
    handleCreateEmpresa, handleSaveEmpresa, confirmDelete
  };
};