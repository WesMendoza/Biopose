import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface Rol {
  idRol?: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [nuevoRol, setNuevoRol] = useState<Rol>({ nombre: '', descripcion: '' });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/gestion-empresas/roles/');
      setRoles(res?.detalle || res || []);
    } catch (error) {
      console.error("Error cargando roles", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateClick = () => {
    setNuevoRol({ nombre: '', descripcion: '' });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (rol: Rol) => {
    setSelectedRol({ ...rol });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (rol: Rol) => {
    setSelectedRol(rol);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedRol(null);
  };

  const handleCreateRol = async () => {
    try {
      await api.post('/api/gestion-empresas/roles/', nuevoRol);
      await fetchRoles();
      closeModals();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando el rol');
    }
  };

  const handleSaveRol = async () => {
    if (selectedRol?.idRol) {
      try {
        await api.patch(`/api/gestion-empresas/roles/${selectedRol.idRol}/`, selectedRol);
        await fetchRoles();
        closeModals();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando el rol');
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedRol?.idRol) {
      try {
        await api.del(`/api/gestion-empresas/roles/${selectedRol.idRol}/`);
        setRoles(roles.filter(r => r.idRol !== selectedRol.idRol));
        closeModals();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error eliminando el rol');
      }
    }
  };

  return {
    roles, loading,
    isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedRol, setSelectedRol,
    nuevoRol, setNuevoRol,
    handleCreateClick, handleEditClick, handleDeleteClick,
    closeModals, handleCreateRol, handleSaveRol, confirmDelete
  };
};