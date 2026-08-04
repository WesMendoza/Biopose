import { Edit2, Save, X } from 'lucide-react';
import { useEmpresas } from '../hooks/useEmpresas';

const GestionEmpresas = () => {
  const {
    empresas, loading,
    isEditModalOpen,
    selectedEmpresa, 
    updateEditEmpresaField,
    handleEditClick,
    closeModals, handleSaveEmpresa
  } = useEmpresas();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Empresas</h1>
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
                  <button onClick={() => handleEditClick(empresa)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Editar Empresa">
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar */}
      {isEditModalOpen && selectedEmpresa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">Editar Empresa</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={selectedEmpresa.nombreEmpresa} 
                  onChange={(e) => updateEditEmpresaField('nombreEmpresa', e.target.value)} 
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC Ecuatoriano</label>
                <input 
                  type="tel" 
                  value={selectedEmpresa.ruc} 
                  onChange={(e) => updateEditEmpresaField('ruc', e.target.value)} 
                  placeholder="13 dígitos numéricos"
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input 
                  type="text" 
                  value={selectedEmpresa.direccion} 
                  onChange={(e) => updateEditEmpresaField('direccion', e.target.value)} 
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeModals} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveEmpresa} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700">
                <Save size={18} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GestionEmpresas;