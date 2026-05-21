import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { User } from '../interface/User';

export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Estados para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
// Estado para el nuevo usuario
  const [newUser, setNewUser] = useState({
    identificacion: '',
    fullName: '',
    email: '',
    password: '',
    idRol: '',      // <-- Nuevo: guardará el ID numérico del rol
    idEmpresa: ''   // <-- Nuevo: guardará el ID numérico de la empresa
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
      // Validamos que haya seleccionado un rol y empresa
      if (!newUser.idRol || !newUser.idEmpresa) {
        alert("Por favor seleccione un Rol y una Empresa");
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
        await api.post('/api/gestion-empresas/asignar-usuario-rol/', {
          idUsuario: newId,
          idEmpresa: Number(newUser.idEmpresa),
          idRol: Number(newUser.idRol),
          estado: 'A'
        });
      }
      
      // Actualizamos la tabla local
      setUsers([...users, {
        id: newId,
        fullName: newUser.fullName,
        identification: newUser.identificacion,
        email: newUser.email,
        role: newUser.idRol, // Temporalmente mostramos el ID o puedes buscar el nombre si lo pasas
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

        await api.patch(`/api/users/actualizar-por-cedula/${selectedUser.identification}/`, payloadUser);
        
        // 2. Actualizar el Rol y Empresa (Opcional, si tu modal permite cambiarlos)
        // Nota: Asumiendo que selectedUser ahora tiene idRol e idEmpresa
        if (selectedUser.idRol && selectedUser.idEmpresa) {
           // Aquí dependerá de si tu backend espera un PUT o PATCH al ID del pivote, 
           // o si tiene un endpoint custom como el de la cédula.
           // Ejemplo de cómo se vería si el backend lo permite por POST de actualización:
           /*
           await api.post('/api/gestion-empresas/asignar-usuario-rol/actualizar/', {
             idUsuario: selectedUser.id,
             idEmpresa: Number(selectedUser.idEmpresa),
             idRol: Number(selectedUser.idRol)
           });
           */
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
          role: u.idRol ? String(u.idRol) : 'N/A',
          isActive: (u.estado || 'A') === 'A'
        }));
        setUsers(mapped);
      })
      .catch(() => {
        // mantener lista vacía en caso de error
      });
  }, []);

  return {
    users,
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