import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { User } from '../interface/User';



export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

 const handleSaveUser = async () => {
    if (selectedUser) {
      try {
        const payload = {
          nombre: selectedUser.fullName.split(' ')[0], 
          apellido: selectedUser.fullName.split(' ').slice(1).join(' '),
          correo: selectedUser.email,
          // Nota: Verifica que el backend no exija el password aquí
        };

        // Consumimos tu endpoint personalizado de PATCH por cédula
        await api.patch(`/api/users/actualizar-por-cedula/${selectedUser.identification}/`, payload);
        
        // Actualizamos estado visual
        setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
        closeModals();
        
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando usuario');
      }
    }
  };

  const confirmDelete = () => {
    if (selectedUser) {
      // Call API to perform logical delete by cedula
      api.del(`/api/users/eliminar/${selectedUser.identification}/`)
        .then(() => {
          setUsers(users.filter((u) => u.id !== selectedUser.id));
          closeModals();
        })
        .catch((err) => {
          alert(err?.response?.mensaje || 'Error eliminando usuario');
        });
    } else {
      closeModals();
    }
  };

  useEffect(() => {
    // Fetch users on mount
    api.get('/api/users/')
      .then((res) => {
        const list = res?.detalle || [];
        const mapped: User[] = list.map((u: any) => ({
          id: u.idUsuario ?? u.id ?? 0,
          fullName: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
          identification: u.cedula || u.identificacion || '',
          email: u.correo || u.email || '',
          role: u.idRol ? String(u.idRol) : 'N/A',
          isActive: (u.estado || 'A') === 'A'
        }));
        setUsers(mapped);
      })
      .catch(() => {
        // keep empty list on error
      });
  }, []);

  return {
    users,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedUser, setSelectedUser,
    handleEditClick,
    handleDeleteClick,
    closeModals,
    handleSaveUser,
    confirmDelete
  };
};