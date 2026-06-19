import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api'; // Importamos tu cliente API

export const useSidebar = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // NUEVO: Guardaremos las rutas (URLs) a las que el usuario tiene acceso
  const [rutasPermitidas, setRutasPermitidas] = useState<string[]>([]);
  const [cargandoMenu, setCargandoMenu] = useState(true);

  useEffect(() => {
    const fetchMenuPermitido = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const idUsuario = decoded.idUsuario;

          if (idUsuario) {
            // Llamamos a tu endpoint en Django que trae los permisos del usuario
            const res = await api.get(`/api/menuOpciones/opciones/usuario/${idUsuario}/`);
            const detalle = res?.detalle || res || [];
            
            // Extraemos solo el texto de la ruta (ej: "/app/users") y lo guardamos
            const rutas = detalle.map((item: any) => item.ruta);
            setRutasPermitidas(rutas);
          }
        } catch (error) {
          console.error("Error al obtener el menú permitido:", error);
        } finally {
          setCargandoMenu(false);
        }
      } else {
        setCargandoMenu(false);
      }
    };

    fetchMenuPermitido();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
      isActive ? 'bg-blue-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    } ${isSidebarOpen ? 'pl-11' : 'justify-center'}`;

  // Función de ayuda para saber si pintar o no el botón
  const tieneAcceso = (rutaRequerida: string) => {
    // Si el array de rutas permitidas incluye la ruta, devuelve true.
    return rutasPermitidas.includes(rutaRequerida);
  };

  return {
    openSection,
    isSidebarOpen,
    toggleSection,
    toggleSidebar,
    handleLogout,
    navLinkClass,
    subNavLinkClass,
    tieneAcceso,    // <--- Pasamos la función al Sidebar
    cargandoMenu    // <--- Para evitar parpadeos visuales
  };
};