import { Edit2, Plus, Save, Trash2, X, CheckSquare } from 'lucide-react';
import { useRoles } from '../hooks/useRoles';

const GestionRoles = () => {
  const {
    roles, loading, rutasDisponibles,
    isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedRol, setSelectedRol,
    nuevoRol, setNuevoRol,
    handleCreateClick, handleEditClick, handleDeleteClick,
    toggleMenuNuevoRol, toggleMenuEditRol,
    closeModals, handleCreateRol, handleSaveRol, confirmDelete
  } = useRoles();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Roles</h1>
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} /><span>Crear Rol</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">Id</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre del Rol</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="p-4 text-center">Cargando...</td></tr> : null}
            {!loading && roles.map((rol) => (
              <tr key={rol.idRol} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-700">{rol.idRol}</td>
                <td className="p-4 text-sm text-gray-700 font-medium">{rol.nombre}</td>
                <td className="p-4 flex justify-center space-x-2">
                  <button onClick={() => handleEditClick(rol)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(rol)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 p-1 rounded-full transition"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4 flex items-center"><Plus className="mr-2 text-blue-600" /> Crear Nuevo Rol</h2>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Rol</label>
                <input 
                  type="text" 
                  placeholder="Ej: Tester IA, Supervisor..." 
                  value={nuevoRol.nombre} 
                  onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })} 
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                />
              </div>

              {/* SECCIÓN DE PERMISOS */}
              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-indigo-500" /> Permisos de Acceso a Pantallas
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 max-h-48 overflow-y-auto">
                  {rutasDisponibles.length > 0 ? (
                    rutasDisponibles.map(opcion => (
                      <label key={opcion.idOption} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition border border-transparent hover:border-gray-200 hover:shadow-sm">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={(nuevoRol.menus_permitidos || []).includes(opcion.idOption)}
                          onChange={() => toggleMenuNuevoRol(opcion.idOption)}
                        />
                        <span className="text-sm font-medium text-gray-700">{opcion.nombreOption}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center p-2">No hay rutas configuradas en el sistema.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end space-x-3 shrink-0">
              <button onClick={closeModals} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
              <button onClick={handleCreateRol} disabled={!nuevoRol.nombre.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium">
                <Save size={18} /><span>Guardar Rol</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && selectedRol && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 p-1 rounded-full transition"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4 flex items-center"><Edit2 className="mr-2 text-green-600" /> Editar Rol</h2>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Rol</label>
                <input 
                  type="text" 
                  value={selectedRol.nombre} 
                  onChange={(e) => setSelectedRol({ ...selectedRol, nombre: e.target.value })} 
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                />
              </div>

              {/* SECCIÓN DE PERMISOS */}
              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-indigo-500" /> Permisos de Acceso a Pantallas
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 max-h-48 overflow-y-auto">
                  {rutasDisponibles.length > 0 ? (
                    rutasDisponibles.map(opcion => (
                      <label key={opcion.idOption} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition border border-transparent hover:border-gray-200 hover:shadow-sm">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          checked={(selectedRol.menus_permitidos || []).includes(opcion.idOption)}
                          onChange={() => toggleMenuEditRol(opcion.idOption)}
                        />
                        <span className="text-sm font-medium text-gray-700">{opcion.nombreOption}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center p-2">No hay rutas configuradas en el sistema.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end space-x-3 shrink-0">
              <button onClick={closeModals} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
              <button onClick={handleSaveRol} disabled={!selectedRol.nombre.trim()} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium">
                <Save size={18} /><span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && selectedRol && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center relative">
            <h2 className="text-xl font-bold mb-2">¿Eliminar Rol?</h2>
            <p className="mb-6 text-sm text-gray-600">Esta acción eliminará el rol <strong>{selectedRol.nombre}</strong> y todos sus permisos asociados. No se puede deshacer.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={closeModals} className="px-6 py-2 border rounded-md hover:bg-gray-50 font-medium text-gray-700">No, cancelar</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRoles;