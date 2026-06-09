import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useEmpresas } from '../hooks/useEmpresas';

const GestionEmpresas = () => {
  const {
    empresas, loading,
    isEditModalOpen, isDeleteModalOpen, isCreateModalOpen,
    selectedEmpresa, setSelectedEmpresa,
    nuevaEmpresa, setNuevaEmpresa,
    handleCreateClick, handleEditClick, handleDeleteClick,
    closeModals, handleCreateEmpresa, handleSaveEmpresa, confirmDelete
  } = useEmpresas();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Empresas</h1>
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} /><span>Crear Empresa</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">Id</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Código</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="p-4 text-sm font-semibold text-gray-600">RUC</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Dirección</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr> : null}
            {!loading && empresas.map((empresa) => (
              <tr key={empresa.codigoEmpresa || empresa.idEmpresa} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-700">{empresa.idEmpresa}</td>
                <td className="p-4 text-sm text-gray-700">{empresa.codigoEmpresa}</td>
                <td className="p-4 text-sm text-gray-700">{empresa.nombreEmpresa}</td>
                <td className="p-4 text-sm text-gray-700">{empresa.ruc}</td>
                <td className="p-4 text-sm text-gray-700">{empresa.direccion}</td>
                <td className="p-4 flex justify-center space-x-2">
                  <button onClick={() => handleEditClick(empresa)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(empresa)} className="p-1 text-red-600 hover:bg-red-100 rounded">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">Crear Empresa</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre" value={nuevaEmpresa.nombreEmpresa} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombreEmpresa: e.target.value })} className="w-full p-2 border rounded-md" />
              <input type="text" placeholder="RUC" value={nuevaEmpresa.ruc} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, ruc: e.target.value })} className="w-full p-2 border rounded-md" />
              <input type="text" placeholder="Dirección" value={nuevaEmpresa.direccion} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, direccion: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeModals} className="px-4 py-2 border rounded-md">Cancelar</button>
              <button onClick={handleCreateEmpresa} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2"><Save size={18} /><span>Guardar</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && selectedEmpresa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">Editar Empresa</h2>
            <div className="space-y-4">
              <input type="text" value={selectedEmpresa.nombreEmpresa} onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, nombreEmpresa: e.target.value })} className="w-full p-2 border rounded-md" />
              <input type="text" value={selectedEmpresa.ruc} onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, ruc: e.target.value })} className="w-full p-2 border rounded-md" />
              <input type="text" value={selectedEmpresa.direccion} onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, direccion: e.target.value })} className="w-full p-2 border rounded-md" />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeModals} className="px-4 py-2 border rounded-md">Cancelar</button>
              <button onClick={handleSaveEmpresa} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2"><Save size={18} /><span>Guardar</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && selectedEmpresa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center relative">
            <h2 className="text-xl font-bold mb-2">¿Eliminar Empresa?</h2>
            <p className="mb-6 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={closeModals} className="px-6 py-2 border rounded-md">No</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-md">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEmpresas;