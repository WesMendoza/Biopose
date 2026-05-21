import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface Empresa {
  idEmpresa?: number;
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  estado?: string;
}

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [nuevaEmpresa, setNuevaEmpresa] = useState<Empresa>({ nombre: '', ruc: '', direccion: '', telefono: '' });

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/gestion-empresas/empresas/');
      setEmpresas(res?.detalle || res || []);
    } catch (error) {
      console.error("Error cargando empresas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleCreateClick = () => {
    setNuevaEmpresa({ nombre: '', ruc: '', direccion: '', telefono: '' });
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
      await api.post('/api/gestion-empresas/empresas/', nuevaEmpresa);
      await fetchEmpresas();
      closeModals();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando la empresa');
    }
  };

  const handleSaveEmpresa = async () => {
    if (selectedEmpresa?.idEmpresa) {
      try {
        await api.patch(`/api/gestion-empresas/empresas/${selectedEmpresa.idEmpresa}/`, selectedEmpresa);
        await fetchEmpresas();
        closeModals();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando la empresa');
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedEmpresa?.idEmpresa) {
      try {
        await api.del(`/api/gestion-empresas/empresas/${selectedEmpresa.idEmpresa}/`);
        setEmpresas(empresas.filter(e => e.idEmpresa !== selectedEmpresa.idEmpresa));
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