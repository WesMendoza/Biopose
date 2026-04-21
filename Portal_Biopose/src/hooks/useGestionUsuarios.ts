import { useState } from 'react';

export interface User {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      fullName: 'Juan Perez',
      identification: '123456789',
      email: 'juan@example.com',
      role: 'Administrador',
      isActive: true,
    },
    {
      id: 2,
      fullName: 'Ana Martinez',
      identification: '987654321',
      email: 'ana@example.com',
      role: 'Visitante',
      isActive: false,
    },
  ]);

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

  const handleSaveUser = () => {
    if (selectedUser) {
      setUsers(
        users.map((u) => (u.id === selectedUser.id ? selectedUser : u))
      );
    }
    closeModals();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
    }
    closeModals();
  };

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