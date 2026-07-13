import { useEffect, useState } from 'react';
import type { User } from '../interface/User';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

// ==========================================================
// ALGORITMO DE VALIDACIÓN ECUATORIANA (CÉDULA)
// ==========================================================
const validarCedula = (cedula: string): boolean => {
  if (cedula.length !== 10) return false;
  
  const prov = parseInt(cedula.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula[9], 10);
  let decenaSuperior = Math.ceil(suma / 10) * 10;
  let resultado = decenaSuperior - suma;
  if (resultado === 10) resultado = 0;

  return resultado === digitoVerificador;
};

export const useGestionUsuarios = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    identificacion: '',
    fullName: '',
    email: '',
    password: '',
    idRol: ''
  });

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

  const cargarDatos = async () => {
    if (!idEmpresa) return;
    try {
      const resRoles = await api.get('/api/gestionEmpresas/roles/');
      const listRoles = resRoles?.detalle || resRoles || [];
      const mappedRoles = listRoles.map((r: any) => ({
        idRol: r.idRol,
        nombreRol: r.nombreRol || r.nombre || `Rol ${r.idRol}`
      }));
      setRoles(mappedRoles);

      const resUsers = await api.get(`/api/users/?idEmpresa=${idEmpresa}`);
      const listUsers = resUsers?.detalle || resUsers || [];
      
      const mappedUsers: User[] = listUsers.map((u: any) => {
        const idRolNum = u.idRol ? Number(u.idRol) : null;
        const rolEncontrado = mappedRoles.find((r: any) => r.idRol === idRolNum);
        
        return {
          id: u.idUsuario ?? u.id ?? 0,
          fullName: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
          identification: u.cedula || u.identificacion || '',
          email: u.correo || u.email || '',
          idRol: idRolNum,
          role: u.nombreRol || rolEncontrado?.nombreRol || 'Sin Rol Asignado',
          isActive: (u.estado || 'A') === 'A'
        };
      });
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

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

  // ==========================================================
  // BLOQUEO EN TIEMPO REAL (Evitar letras en Cédula)
  // ==========================================================
  const updateNewUserField = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'identificacion') {
      finalValue = value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
      if (finalValue.length > 10) finalValue = finalValue.slice(0, 10);
    }
    setNewUser({ ...newUser, [field]: finalValue });
  };

  const updateEditUserField = (field: keyof User, value: any) => {
    if (!selectedUser) return;
    let finalValue = value;
    if (field === 'identification') {
      finalValue = String(value).replace(/\D/g, ''); // Eliminar todo lo que no sea número
      if (finalValue.length > 10) finalValue = finalValue.slice(0, 10);
    }
    setSelectedUser({ ...selectedUser, [field]: finalValue });
  };

  const handleCreateUser = async () => {
    // 1. Validar Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert("Por favor ingrese un correo electrónico válido.");
      return;
    }

    // 2. Validar Cédula Ecuatoriana
    if (!validarCedula(newUser.identificacion)) {
      alert("La cédula ingresada no es válida. Verifique los números.");
      return;
    }

    if (!newUser.idRol) {
      alert("Por favor seleccione un Rol");
      return;
    }

    try {
      const payloadUser = {
        nombre: newUser.fullName.split(' ')[0],
        apellido: newUser.fullName.split(' ').slice(1).join(' ') || '',
        cedula: newUser.identificacion,
        correo: newUser.email,
        password: newUser.password,
      };

      const resUser = await api.post('/api/users/', payloadUser);
      const newId = resUser?.detalle?.idUsuario || resUser?.detalle?.id;

      if (newId) {
        const assignPayload: any = {
          idUsuario: newId,
          idRol: Number(newUser.idRol),
          estado: 'A',
          idEmpresa: Number(idEmpresa)
        };
        await api.post('/api/gestionEmpresas/asignarUsuarioRol/', assignPayload);
      }
      
      closeModals();
      cargarDatos();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error creando usuario o asignando rol');
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    // 1. Validar Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedUser.email)) {
      alert("Por favor ingrese un correo electrónico válido.");
      return;
    }

    // (Opcional) Validar cédula si tu backend permite editarla
    if (!validarCedula(selectedUser.identification)) {
      alert("La cédula ingresada no es válida. Verifique los números.");
      return;
    }

    try {
      const payloadUser = {
        nombre: selectedUser.fullName.split(' ')[0], 
        apellido: selectedUser.fullName.split(' ').slice(1).join(' '),
        correo: selectedUser.email,
      };

      await api.patch(`/api/users/actualizarPorCedula/${selectedUser.identification}/`, payloadUser);
      
      if (selectedUser.idRol) {
        await api.put('/api/gestionEmpresas/asignarUsuarioRol/reasignar/', {
          idUsuario: selectedUser.id,
          idRol: Number(selectedUser.idRol),
          idEmpresa: Number(idEmpresa)
        });
      }

      closeModals();
      cargarDatos();
    } catch (err: any) {
      alert(err?.response?.mensaje || 'Error actualizando usuario');
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await api.del(`/api/users/eliminar/${selectedUser.identification}/`);
        closeModals();
        cargarDatos();
      } catch (err: any) {
        alert(err?.response?.mensaje || 'Error eliminando usuario');
      }
    } else {
      closeModals();
    }
  };

  return {
    users, roles, isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedUser, newUser, 
    updateNewUserField, updateEditUserField, // Nuevas funciones expuestas
    handleEditClick, handleDeleteClick, handleCreateClick, closeModals,
    handleSaveUser, handleCreateUser, confirmDelete
  };
};