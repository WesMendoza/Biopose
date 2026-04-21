import { useState } from 'react';

export interface RouteItem {
  id: number;
  directory: string;
  createdAt: string;
}

export const useConfiguracionRutas = () => {
  const [mainPath, setMainPath] = useState('');
  const [fps, setFps] = useState<number | ''>('');
  const [isEditingFps, setIsEditingFps] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([
    { id: 1, directory: '/videos/test1', createdAt: '2023-10-01' },
    { id: 2, directory: '/videos/training', createdAt: '2023-10-05' },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const handleSaveMainPath = () => {
    alert(`Ruta principal guardada: ${mainPath}`);
  };

  const handleSaveFps = () => {
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
    handleSaveMainPath,
    handleSaveFps,
    handleCreateFolder,
    handleDeleteRoute
  };
};