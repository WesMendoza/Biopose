import { useEffect, useState } from 'react';
import type { User } from '../interface/User';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode'; // Importamos para extraer la empresa del usuario loggeado

export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);

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
    idRol: ''
  });

  // 1. EXTRAER LA EMPRESA DEL USUARIO LOGGEADO DESDE EL TOKEN
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

  // 2. CARGAR DATOS SINCRONIZADOS (Roles primero, luego Usuarios)
  const cargarDatos = async () => {
    if (!idEmpresa) return;

    try {
      // A) Obtener catálogo de roles
      const resRoles = await api.get('/api/gestionEmpresas/roles/');
      const listRoles = resRoles?.detalle || resRoles || [];
      const mappedRoles = listRoles.map((r: any) => ({
        idRol: r.idRol,
        nombreRol: r.nombreRol || r.nombre || `Rol ${r.idRol}`
      }));
      setRoles(mappedRoles);

      // B) Obtener usuarios FILTRADOS por la empresa actual
      // Enviamos ?idEmpresa para que el backend sepa cuáles devolver
      const resUsers = await api.get(`/api/users/?idEmpresa=${idEmpresa}`);
      const listUsers = resUsers?.detalle || resUsers || [];
      
      const mappedUsers: User[] = listUsers.map((u: any) => {
        const idRolNum = u.idRol ? Number(u.idRol) : null;
        
        // ¡MAGIA!: Cruzamos el idRol que viene del usuario con la lista de roles para obtener el texto real
        const rolEncontrado = mappedRoles.find((r: any) => r.idRol === idRolNum);
        
        return {
          id: u.idUsuario ?? u.id ?? 0,
          fullName: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
          identification: u.cedula || u.identificacion || '',
          email: u.correo || u.email || '',
          idRol: idRolNum,
          role: u.nombreRol || rolEncontrado?.nombreRol || 'Sin Rol Asignado', // <--- Mostrará 'Administrador'
          isActive: (u.estado || 'A') === 'A'
        };
      });
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // Disparamos la carga al abrir la pantalla
  useEffect(() => {
    cargarDatos();
  }, [idEmpresa]);

  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateClick = () => {
    setNewUser({ identificacion: '', fullName: '', email: '', password: '', idRol: '' });
    setIsCreateModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedUser(null);
  };

  // POST: Crear usuario y asignarle Rol a LA EMPRESA ACTUAL
  const handleCreateUser = async () => {
    try {
      if (!newUser.idRol) {
        alert("Por favor seleccione un Rol");
        return;
      }

      // PASO 1: Crear el usuario base
      const payloadUser = {
        nombre: newUser.fullName.split(' ')[0],
        apellido: newUser.fullName.split(' ').slice(1).join(' ') || '',
        cedula: newUser.identificacion,
        correo: newUser.email,
        password: newUser.password,
      };

      const resUser = await api.post('/api/users/', payloadUser);
      const newId = resUser?.detalle?.idUsuario || resUser?.detalle?.id;

      // PASO 2: Asignar Rol obligatoriamente en la empresa loggeada
      if (newId) {
        const assignPayload: any = {
          idUsuario: newId,
          idRol: Number(newUser.idRol),
          estado: 'A',
          idEmpresa: Number(idEmpresa) // <--- Forzamos la asignación a TU empresa
        };
        await api.post('/api/gestionEmpresas/asignarUsuarioRol/', assignPayload);
      }
      
      closeModals();
      cargarDatos(); // Recargamos la tabla para que aparezca
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando usuario o asignando rol');
    }
  };

  // PATCH: Actualizar usuario por cédula
  const handleSaveUser = async () => {
    if (selectedUser) {
      try {
        const payloadUser = {
          nombre: selectedUser.fullName.split(' ')[0], 
          apellido: selectedUser.fullName.split(' ').slice(1).join(' '),
          correo: selectedUser.email,
        };

        await api.patch(`/api/users/actualizarPorCedula/${selectedUser.identification}/`, payloadUser);
        
        // Actualizar el Rol del usuario si se cambió
        if (selectedUser.idRol) {
          await api.put('/api/gestionEmpresas/asignarUsuarioRol/reasignar/', {
            idUsuario: selectedUser.id,
            idRol: Number(selectedUser.idRol),
            idEmpresa: Number(idEmpresa)
          });
        }

        closeModals();
        cargarDatos(); // Recargamos la tabla
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error actualizando usuario');
      }
    }
  };

  // DELETE: Eliminación lógica por cédula
  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await api.del(`/api/users/eliminar/${selectedUser.identification}/`);
        closeModals();
        cargarDatos(); // Recargamos la tabla
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error eliminando usuario');
      }
    } else {
      closeModals();
    }
  };

  return {
    users, roles, isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedUser, setSelectedUser, newUser, setNewUser,
    handleEditClick, handleDeleteClick, handleCreateClick, closeModals,
    handleSaveUser, handleCreateUser, confirmDelete
  };
};