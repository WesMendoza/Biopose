import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importamos el decodificador
import api from '../lib/api'; 
import type { RouteItem } from '../interface/RouteItem';
import { useToast } from '../contexts/ToastContext';

export const useConfiguracionRutas = () => {
  const { showToast } = useToast();
  const [mainPath, setMainPath] = useState('');
  const [fps, setFps] = useState<number | ''>('');
  const [isEditingFps, setIsEditingFps] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Extraemos el idEmpresa directamente del JWT
  const getEmpresaId = () => {
    const token = localStorage.getItem('token'); // Ajusta según donde guardes tu token
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.idEmpresa;
    } catch {
      return null;
    }
  };

  const idEmpresa = getEmpresaId();

  // 2. CARGAR DATOS (Ahora usamos el idEmpresa en la URL)
  const fetchConfiguraciones = async () => {
    if (!idEmpresa) return;
    try {
      const cacheKey = `config_${idEmpresa}`;
      const cachedConfig = sessionStorage.getItem(cacheKey);
      let data;
      
      if (cachedConfig) {
        data = JSON.parse(cachedConfig);
      } else {
        data = await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
      
      if (!Array.isArray(data)) {
        return;
      }
      
      const loadedRoutes: RouteItem[] = [];
      data.forEach((item: any) => {
        if (item.codigo === 'RUTA_PRINCIPAL') {
          setMainPath(item.valor);
        } else if (item.codigo === 'FPS_DEFAULT') {
          setFps(Number(item.valor)); 
        } else if (item.codigo.startsWith('SUBRUTA_')) {
          const fechaDB = item.fechaCreacion || item.fecha_creacion || item.createdAt;
          const fechaFormateada = fechaDB ? new Date(fechaDB).toLocaleDateString() : 'Sin fecha';
          loadedRoutes.push({
            id: Date.now() + Math.random(), 
            directory: item.valor,
            createdAt: fechaFormateada 
          });
        }
      });
      setRoutes(loadedRoutes);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, [idEmpresa]);

  // 3. GUARDAR EN BD (Ahora enviamos el idEmpresa en el POST)
  const guardarEnBaseDeDatos = async (codigo: string, valor: string) => {
    if (!idEmpresa) return false;
    setIsSaving(true);
    try {
      await api.post('/api/menuOpciones/rutas/configurar/', { 
        codigo, 
        valor,
        idEmpresa // Enviamos la empresa al back
      });
      // Limpiar caché para que otras pantallas recarguen el cambio
      sessionStorage.removeItem(`config_${idEmpresa}`);
      return true;
    } catch (error) {;
      showToast("Error al guardar la configuración.", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // --- HANDLERS (Iguales, pero ahora llaman al guardar unificado) ---
  const handleSaveMainPath = async () => {
    if (await guardarEnBaseDeDatos('RUTA_PRINCIPAL', mainPath)) {
      showToast("Ruta principal guardada con éxito.", "success");
    }
  };

  const handleSaveFps = async () => {
    if (await guardarEnBaseDeDatos('FPS_DEFAULT', String(fps))) {
      setIsEditingFps(false);
      showToast("FPS guardados con éxito.", "success");
    }
  };

  const handleCreateFolder = async () => {
    const fullPath = `${mainPath}\\${newFolderName}`;
    if (await guardarEnBaseDeDatos(`SUBRUTA_${Date.now()}`, fullPath)) {
      setRoutes([...routes, { id: Date.now(), directory: fullPath, createdAt: new Date().toLocaleDateString() }]);
      setIsCreateModalOpen(false);
      setNewFolderName('');
      showToast("Subruta creada con éxito.", "success");
    }
  };
  const handleDeleteRoute = async () => {
    if (selectedRoute) {
      setRoutes(routes.filter((r) => r.id !== selectedRoute.id));
      setIsDeleteModalOpen(false);
      setSelectedRoute(null);
    }
  };

  return {
    mainPath, setMainPath, fps, setFps, isEditingFps, setIsEditingFps, routes,
    isCreateModalOpen, setIsCreateModalOpen, isDeleteModalOpen, setIsDeleteModalOpen,
    newFolderName, setNewFolderName, selectedRoute, setSelectedRoute, isSaving,
    handleSaveMainPath, handleSaveFps, handleCreateFolder ,handleDeleteRoute
  };
};