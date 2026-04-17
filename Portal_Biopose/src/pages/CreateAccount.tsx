import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Building, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    empresa: '',
    celular: '',
    password: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to create account
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex overflow-hidden">
        
        {/* Left Sidebar Image/Decor */}
        <div className="w-1/3 bg-indigo-600 hidden md:flex flex-col items-center justify-center p-8 text-white">
          <UserPlus size={64} className="mb-6 opacity-80" />
          <h2 className="text-2xl font-bold mb-4 text-center">Únete a BioPose</h2>
          <p className="text-center text-indigo-100 mb-8">
            Crea tu cuenta para acceder a potentes herramientas de detección y análisis de comportamiento por video.
          </p>
          <div className="space-y-4 w-full">
            <div className="flex items-center text-sm font-medium opacity-80">
              <CheckCircle className="w-5 h-5 mr-3 text-indigo-300" />
              <span>Acceso a Modelos 2D y 3D</span>
            </div>
            <div className="flex items-center text-sm font-medium opacity-80">
              <CheckCircle className="w-5 h-5 mr-3 text-indigo-300" />
              <span>Detección de Múltiples Personas</span>
            </div>
            <div className="flex items-center text-sm font-medium opacity-80">
              <CheckCircle className="w-5 h-5 mr-3 text-indigo-300" />
              <span>Análisis de Comportamiento</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="w-full md:w-2/3 p-8 lg:p-12 relative flex flex-col justify-center">
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
            Crear Cuenta
          </h2>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center bg-green-50 rounded-lg border border-green-200 p-8 my-8 transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">¡Cuenta Creada Exitosamente!</h3>
              <p className="text-green-600 text-center">Serás redirigido al inicio de sesión en breve...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="identificacion"
                      value={formData.identificacion}
                      onChange={handleChange}
                      required
                      placeholder="Ej: 0102030405"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres Completos</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Juan"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos Completos</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Pérez"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                      placeholder="juan@ejemplo.com"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      required
                      placeholder="Empresa EJ."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium w-5 h-5">#</span>
                    <input
                      type="tel"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      required
                      placeholder="099xxxxxxx"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="*********"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-md py-3 font-semibold hover:bg-indigo-700 transition"
                >
                  Registrarse
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;