import { useState, useEffect } from 'react';
import type { RouteItem } from '../interface/RouteItem';

export const useConfiguracionRutas = () => {
  // Inicializamos leyendo de localStorage o valores por defecto
  const [mainPath, setMainPath] = useState(() => localStorage.getItem('biopose_mainPath') || '');
  const [fps, setFps] = useState<number | ''>(() => {
    const saved = localStorage.getItem('biopose_fps');
    return saved ? Number(saved) : '';
  });
  
  const [isEditingFps, setIsEditingFps] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>(() => {
    const saved = localStorage.getItem('biopose_routes');
    return saved ? JSON.parse(saved) : [
      { id: 1, directory: '/videos/test1', createdAt: '2023-10-01' }
    ];
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  // Efectos para guardar automáticamente en localStorage cuando cambian
  useEffect(() => { localStorage.setItem('biopose_routes', JSON.stringify(routes)); }, [routes]);
  useEffect(() => { localStorage.setItem('biopose_mainPath', mainPath); }, [mainPath]);

  const handleSaveMainPath = () => {
    localStorage.setItem('biopose_mainPath', mainPath);
    alert(`Ruta principal guardada: ${mainPath}`);
  };

  const handleSaveFps = () => {
    if (fps !== '') localStorage.setItem('biopose_fps', String(fps));
    setIsEditingFps(false);
    alert(`FPS guardado: ${fps}`);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    const newRoute: RouteItem = {
      id: Date.now(),
      directory: `${mainPath ? mainPath + '/' : ''}${newFolderName}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRoutes([...routes, newRoute]);
    setNewFolderName('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteRoute = () => {
    if (selectedRoute) {
      setRoutes(routes.filter((r) => r.id !== selectedRoute.id));
      setIsDeleteModalOpen(false);
      setSelectedRoute(null);
    }
  };

  return {
    mainPath, setMainPath,
    fps, setFps,
    isEditingFps, setIsEditingFps,
    routes, setRoutes,
    isCreateModalOpen, setIsCreateModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    newFolderName, setNewFolderName,
    selectedRoute, setSelectedRoute,
    handleSaveMainPath, handleSaveFps, handleCreateFolder, handleDeleteRoute
  };
};