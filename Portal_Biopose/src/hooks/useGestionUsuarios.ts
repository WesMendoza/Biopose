import { useEffect, useState } from 'react';
import type { User } from '../interface/User';
import api from '../lib/api';

export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Estados para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);
  
// Estado para el nuevo usuario
  const [newUser, setNewUser] = useState({
    identificacion: '',
    fullName: '',
    email: '',
    password: '',
    idRol: '',      // en el backend se espera un id numérico de rol
    idEmpresa: ''   // opcional si el usuario administrador tiene una empresa asignada
  });

  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateClick = () => {
    setNewUser({ identificacion: '', fullName: '', email: '', password: '', idRol: '', idEmpresa: '' });
    setIsCreateModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedUser(null);
  };

 // POST: Crear usuario y asignarle Rol/Empresa
  const handleCreateUser = async () => {
    try {
      // Validamos que haya seleccionado un rol
      if (!newUser.idRol) {
        alert("Por favor seleccione un Rol");
        return;
      }

      // PASO 1: Crear el usuario
      const payloadUser = {
        nombre: newUser.fullName.split(' ')[0],
        apellido: newUser.fullName.split(' ').slice(1).join(' ') || '',
        cedula: newUser.identificacion,
        correo: newUser.email,
        password: newUser.password,
      };

      const resUser = await api.post('/api/users/', payloadUser);
      const newId = resUser?.detalle?.idUsuario || resUser?.detalle?.id;

      // PASO 2: Asignar Rol y Empresa en la tabla pivote
      if (newId) {
        const assignPayload: any = {
          idUsuario: newId,
          idRol: Number(newUser.idRol),
          estado: 'A'
        };
        if (newUser.idEmpresa) {
          assignPayload.idEmpresa = Number(newUser.idEmpresa);
        }
        await api.post('/api/gestionEmpresas/asignarUsuarioRol/', assignPayload);
      }
      
      // Actualizamos la tabla local
      setUsers([...users, {
        id: newId,
        fullName: newUser.fullName,
        identification: newUser.identificacion,
        email: newUser.email,
        idRol: newUser.idRol,
        role: roles.find((rol) => String(rol.idRol) === String(newUser.idRol))?.nombreRol || newUser.idRol,
        isActive: true
      }]);
      
      closeModals();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando usuario o asignando rol');
    }
  };

// PATCH: Actualizar usuario por cédula
  const handleSaveUser = async () => {
    if (selectedUser) {
      try {
        // 1. Actualizar datos base del usuario
        const payloadUser = {
          nombre: selectedUser.fullName.split(' ')[0], 
          apellido: selectedUser.fullName.split(' ').slice(1).join(' '),
          correo: selectedUser.email,
        };

        await api.patch(`/api/users/actualizarPorCedula/${selectedUser.identification}/`, payloadUser);
        
        // 2. Actualizar el Rol del usuario si se cambió
        if (selectedUser.idRol) {
          await api.put('/api/gestionEmpresas/asignarUsuarioRol/reasignar/', {
            idUsuario: selectedUser.id,
            idRol: Number(selectedUser.idRol)
          });
        }

        setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
        closeModals();
        
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando usuario');
      }
    }
  };

  // DELETE: Eliminación lógica por cédula
  const confirmDelete = () => {
    if (selectedUser) {
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
    api.get('/api/users/')
      .then((res) => {
        const list = res?.detalle || [];
        const mapped: User[] = list.map((u: any) => ({
          id: u.idUsuario ?? u.id ?? 0,
          fullName: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
          identification: u.cedula || u.identificacion || '',
          email: u.correo || u.email || '',
          idRol: u.idRol ?? undefined,
          role: u.role || (u.idRol ? String(u.idRol) : 'N/A'),
          isActive: (u.estado || 'A') === 'A'
        }));
        setUsers(mapped);
      })
      .catch(() => {
        // mantener lista vacía en caso de error
      });
  }, []);

  useEffect(() => {
    api.get('/api/gestionEmpresas/roles/')
      .then((res) => {
        const list = res?.detalle || res || [];
        const mappedRoles = list.map((r: any) => ({
          idRol: r.idRol,
          nombreRol: r.nombreRol || r.nombre || `Rol ${r.idRol}`
        }));
        setRoles(mappedRoles);
      })
      .catch(() => {
        setRoles([]);
      });
  }, []);

  return {
    users,
    roles,
    isEditModalOpen,
    isDeleteModalOpen,
    isCreateModalOpen,
    selectedUser, setSelectedUser,
    newUser, setNewUser,
    handleEditClick,
    handleDeleteClick,
    handleCreateClick,
    closeModals,
    handleSaveUser,
    handleCreateUser,
    confirmDelete
  };
};