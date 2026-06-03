import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export interface Rol {
  idRol?: number;
  nombre: string;
  estado?: string;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [nuevoRol, setNuevoRol] = useState<Rol>({ nombre: '' });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/gestionEmpresas/roles/');
      const backendRoles = res?.detalle || res || [];
      const mappedRoles: Rol[] = backendRoles.map((rol: any) => ({
        idRol: rol.idRol,
        nombre: rol.nombreRol || rol.nombre || '',
        estado: rol.estado || '',
      }));
      setRoles(mappedRoles);
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
    setNuevoRol({ nombre: '' });
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
      await api.post('/api/gestionEmpresas/roles/', {
        nombreRol: nuevoRol.nombre,
      });
      await fetchRoles();
      closeModals();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando el rol');
    }
  };

  const handleSaveRol = async () => {
    if (selectedRol?.idRol) {
      try {
        await api.patch(`/api/gestionEmpresas/roles/${selectedRol.idRol}/`, {
          nombreRol: selectedRol.nombre,
        });
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
        await api.del(`/api/gestionEmpresas/roles/${selectedRol.idRol}/`);
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