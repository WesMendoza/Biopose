import React from 'react';
import { Save, Edit, X, Settings, Activity } from 'lucide-react';
import { useConfiguracionRutas } from '../hooks/useConfiguracionRutas';
import videoGif from '../assets/video.gif';
import bannerLogin2 from '../assets/bannerLogin2.webp';

const ConfiguracionRutas = () => {
  const {
    fps, setFps,
    isEditingFps, setIsEditingFps,
    handleSaveFps,
  } = useConfiguracionRutas();

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-[85vh] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Settings className="w-6 h-6 mr-3 text-indigo-600" />
        Configuración de Análisis
      </h1>

      {/* BANNER GIGANTE PARA RELLENAR ESPACIO Y DARLE ESTILO PREMIUM */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64 lg:h-80 relative shrink-0 group">
        <img src={bannerLogin2} alt="Banner BioPose" className="w-full h-full object-cover object-[center_18%] transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent flex flex-col justify-end p-8 lg:p-12">
           <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Motor de Inteligencia Artificial</h2>
           <p className="text-indigo-100 max-w-3xl text-sm lg:text-base leading-relaxed">
             Ajusta los parámetros de rendimiento y procesamiento para obtener los mejores resultados en la detección de comportamientos anómalos y violentos. Optimiza la velocidad según los recursos de tu equipo.
           </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Lado izquierdo: Ilustración y descripción */}
          <div className="bg-indigo-50/50 p-10 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6 inline-flex border border-indigo-100">
              <img src={videoGif} alt="Configuración FPS" className="w-32 h-32 object-cover rounded-full mix-blend-multiply" />
            </div>
            <h2 className="text-xl font-bold text-indigo-900 mb-3">Optimización de Rendimiento</h2>
            <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
              El ajuste de los fotogramas por segundo (FPS) permite controlar el equilibrio entre la velocidad de procesamiento de la Inteligencia Artificial y la precisión del análisis en video.
            </p>
          </div>

          {/* Lado derecho: Control de FPS */}
          <div className="p-10 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Activity size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Parámetros de FPS</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Fotogramas a omitir / procesar
                </label>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      disabled={!isEditingFps}
                      placeholder="Ej. 5"
                      min="1"
                      max="30"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 text-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">FPS</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    {!isEditingFps ? (
                      <button
                        onClick={() => setIsEditingFps(true)}
                        className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                        title="Editar parámetro"
                      >
                        <Edit size={20} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveFps}
                          className="p-3 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors border border-green-200"
                          title="Guardar"
                        >
                          <Save size={20} />
                        </button>
                        <button
                          onClick={() => setIsEditingFps(false)}
                          className="p-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-200"
                          title="Cancelar"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 text-xs text-gray-500 flex items-start space-x-2">
                  <span className="text-amber-500 shrink-0">⚠️</span>
                  <p>Un valor alto significa que la IA analizará más rápido, mientras que un valor bajo (hasta 1) hará que tarde más tiempo pero ofrezca un análisis mucho más preciso.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          TABLA DE RUTAS Y MODALES (COMENTADOS) 
          ========================================================= */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

      {isDeleteModalOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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
      */}
    </div>
  );
};

export default ConfiguracionRutas;