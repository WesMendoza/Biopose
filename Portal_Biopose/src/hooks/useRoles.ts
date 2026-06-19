import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { MenuOpcion } from '../interface/MenuOpcion';
import type { Rol } from '../interface/Rol';

export const useRoles = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rutasDisponibles, setRutasDisponibles] = useState<MenuOpcion[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [nuevoRol, setNuevoRol] = useState<Rol>({ nombre: '', menus_permitidos: [] });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/gestionEmpresas/roles/');
      const backendRoles = res?.detalle || res || [];
      const mappedRoles: Rol[] = backendRoles.map((rol: any) => ({
        idRol: rol.idRol,
        nombre: rol.nombreRol || rol.nombre || '',
        estado: rol.estado || '',
        menus_permitidos: rol.menus_permitidos || [], 
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error("Error cargando roles", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRutasDisponibles = useCallback(async () => {
    try {
      // CORRECCIÓN: Agregamos "opciones/" al final de la ruta
      const res = await api.get('/api/menuOpciones/opciones/'); 
      
      const backendRutas = res?.detalle || res || [];
      setRutasDisponibles(backendRutas);
    } catch (error) {
      console.error("Error cargando las rutas del sistema", error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchRutasDisponibles();
  }, [fetchRoles, fetchRutasDisponibles]);

  const handleCreateClick = () => {
    setNuevoRol({ nombre: '', menus_permitidos: [] });
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

  const toggleMenuNuevoRol = (idMenu: number) => {
    setNuevoRol(prev => {
      const menus = prev.menus_permitidos || [];
      if (menus.includes(idMenu)) {
        return { ...prev, menus_permitidos: menus.filter(id => id !== idMenu) };
      } else {
        return { ...prev, menus_permitidos: [...menus, idMenu] };
      }
    });
  };

  const toggleMenuEditRol = (idMenu: number) => {
    if (!selectedRol) return;
    setSelectedRol(prev => {
      if (!prev) return prev;
      const menus = prev.menus_permitidos || [];
      if (menus.includes(idMenu)) {
        return { ...prev, menus_permitidos: menus.filter(id => id !== idMenu) };
      } else {
        return { ...prev, menus_permitidos: [...menus, idMenu] };
      }
    });
  };

  const handleCreateRol = async () => {
    try {
      await api.post('/api/gestionEmpresas/roles/', {
        nombreRol: nuevoRol.nombre,
        menus_permitidos: nuevoRol.menus_permitidos, 
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
          menus_permitidos: selectedRol.menus_permitidos, 
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
    roles, loading, rutasDisponibles,
    isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedRol, setSelectedRol,
    nuevoRol, setNuevoRol,
    handleCreateClick, handleEditClick, handleDeleteClick,
    toggleMenuNuevoRol, toggleMenuEditRol,
    closeModals, handleCreateRol, handleSaveRol, confirmDelete
  };
};