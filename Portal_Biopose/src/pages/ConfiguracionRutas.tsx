import React, { useState } from 'react';
import { Save, Edit, X, FolderPlus, Trash2, Folder } from 'lucide-react';

interface RouteItem {
  id: number;
  directory: string;
  createdAt: string;
}

const ConfiguracionRutas = () => {
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Archivos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Main Path Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h5 className="text-lg font-semibold text-gray-700 mb-4">Parametrización de Rutas</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ruta Principal:</label>
              <input
                type="text"
                value={mainPath}
                onChange={(e) => setMainPath(e.target.value)}
                placeholder="Pega aquí la ruta que tendrá tu proyecto completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSaveMainPath}
              className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <Save size={18} className="mr-2" />
              Guardar configuración
            </button>
          </div>
        </div>

        {/* FPS Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h5 className="text-lg font-semibold text-gray-700 mb-4">Parametrización de FPS</h5>
          <div className="flex items-center space-x-3 mt-6">
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              disabled={!isEditingFps}
              placeholder="Valor no definido"
              min="1"
              max="24"
              className="w-32 px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500 text-right"
            />
            <span className="text-gray-600 font-medium">FPS</span>

            <div className="flex space-x-2 ml-4">
              {!isEditingFps ? (
                <button
                  onClick={() => setIsEditingFps(true)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                  title="Editar FPS"
                >
                  <Edit size={20} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveFps}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Guardar FPS"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => setIsEditingFps(false)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Cancelar"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Define la cantidad de frames por segundo para el análisis de video.
          </p>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Rutas Parametrizadas Actualmente</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <FolderPlus size={18} className="mr-2" />
            Agregar Nueva Carpeta
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-600">Id</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Directorio</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Fecha Creación</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700 gap-2 flex items-center">
                    <Folder size={16} className="text-indigo-400" />
                    {route.id}
                  </td>
                  <td className="p-4 text-sm text-gray-700">{route.directory}</td>
                  <td className="p-4 text-sm text-gray-700">{route.createdAt}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay rutas parametrizadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Nueva Carpeta</h2>
            
            <div className="mb-6 relative">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ingresa el nombre de tu carpeta"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FolderPlus className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border-gray-300 border text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Crear Carpeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 flex items-center justify-center rounded-full mb-4">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">¿Estás seguro de eliminar la carpeta?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Se perderán todas las imágenes que contenga el directorio: <br />
              <strong className="text-gray-700 break-all">{selectedRoute.directory}</strong>
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 border-gray-300 border text-gray-700 rounded-md hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={handleDeleteRoute}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionRutas;