import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useGestionUsuarios } from '../hooks/useGestionUsuarios';

const GestionUsuarios = () => {
  const {
    users,
    roles,
    isEditModalOpen,
    isDeleteModalOpen,
    isCreateModalOpen,
    selectedUser,
    newUser,
    updateNewUserField,
    updateEditUserField,
    handleEditClick,
    handleDeleteClick,
    handleCreateClick,
    closeModals,
    handleSaveUser,
    handleCreateUser,
    confirmDelete
  } = useGestionUsuarios();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de usuarios</h1>
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Crear Usuario</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">Id</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre Completo</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Identificación</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Correo</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Rol</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-700">{user.id}</td>
                <td className="p-4 text-sm text-gray-700">{user.fullName}</td>
                <td className="p-4 text-sm text-gray-700">{user.identification}</td>
                <td className="p-4 text-sm text-gray-700">{user.email}</td>
                <td className="p-4 text-sm text-gray-700">{user.role}</td>
                <td className="p-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Usuario */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Usuario</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Identificación (Cédula)</label>
                <input
                  type="tel"
                  value={newUser.identificacion}
                  onChange={(e) => updateNewUserField('identificacion', e.target.value)}
                  placeholder="10 dígitos numéricos"
                  className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => updateNewUserField('fullName', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => updateNewUserField('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => updateNewUserField('password', e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select
                  value={newUser.idRol}
                  onChange={(e) => updateNewUserField('idRol', e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombreRol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save size={18} />
                <span>Crear Usuario</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Identificación (Cédula)</label>
                <input
                  type="tel"
                  value={selectedUser.identification}
                  onChange={(e) => updateEditUserField('identification', e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                  disabled // Mantengo el disabled por si tu API prohíbe editar cédulas, pero la protección ya existe
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) => updateEditUserField('fullName', e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => updateEditUserField('email', e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={selectedUser.idRol ?? ''}
                    onChange={(e) => {
                      updateEditUserField('idRol', e.target.value);
                      updateEditUserField('role', e.target.options[e.target.selectedIndex].text);
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.idRol} value={rol.idRol}>
                        {rol.nombreRol}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado Activo</label>
                  <div className="mt-2 flex items-center h-full">
                    <input
                      type="checkbox"
                      checked={selectedUser.isActive}
                      onChange={(e) => updateEditUserField('isActive', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Save size={18} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Usuario */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center relative">
            <h2 className="text-xl font-bold mb-2">¿Estás seguro de eliminar este usuario?</h2>
            <p className="text-gray-600 mb-6 text-sm">
              El usuario será eliminado y ya no podrá acceder al sistema.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeModals}
                className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
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

export default GestionUsuarios;