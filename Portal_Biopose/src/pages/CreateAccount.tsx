import { UserPlus, User, Mail, Lock, Building, CheckCircle, Briefcase, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreateAccount } from '../hooks/useCreateAccount';

const CreateAccount = () => {
  const {
    formData, empresas, isSuccess, isCrearEmpresa, setIsCrearEmpresa, handleChange, handleSubmit
  } = useCreateAccount();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0ea5e9] opacity-[0.08] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl flex overflow-hidden relative z-10">
        
        {/* Panel Izquierdo */}
        <div className="w-1/3 bg-[#2563eb] hidden md:flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <UserPlus size={56} className="mb-4 text-white/90" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-3 text-center tracking-tight">Únete a BioPose</h2>
          <p className="text-center text-blue-100 mb-8 text-sm leading-relaxed">
            Crea tu cuenta para acceder a potentes herramientas de detección.
          </p>
          
          <div className="space-y-3 w-full">
            <div className="flex items-center text-xs font-medium text-blue-100/90">
              <CheckCircle className="w-4 h-4 mr-2 text-sky-300 flex-shrink-0" />
              <span>Acceso a Modelos 2D y 3D</span>
            </div>
            <div className="flex items-center text-xs font-medium text-blue-100/90">
              <CheckCircle className="w-4 h-4 mr-2 text-sky-300 flex-shrink-0" />
              <span>Detección de Múltiples Personas</span>
            </div>
            <div className="flex items-center text-xs font-medium text-blue-100/90">
              <CheckCircle className="w-4 h-4 mr-2 text-sky-300 flex-shrink-0" />
              <span>SaaS Auto-administrable</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="w-full md:w-2/3 p-8 md:p-10 relative flex flex-col justify-center">
          
          <h2 className="text-[26px] font-extrabold text-gray-900 mb-6 text-center md:text-left tracking-tight">
            Crear Cuenta
          </h2>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl border border-green-200 p-8 transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">¡Cuenta Creada!</h3>
              <p className="text-green-600 text-center text-sm">Serás redirigido al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Inputs de texto estándar */}
                {[
                  { label: "Identificación (Cédula)", name: "identificacion", icon: User, type: "tel", placeholder: "10 dígitos" },
                  { label: "Nombres Completos", name: "nombres", icon: User, type: "text", placeholder: "Ej: Juan" },
                  { label: "Apellidos Completos", name: "apellidos", icon: User, type: "text", placeholder: "Ej: Pérez" },
                  { label: "Correo Electrónico", name: "correo", icon: Mail, type: "email", placeholder: "juan@ejemplo.com" },
                ].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        required
                        placeholder={field.placeholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-[#f1f5f9] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* TOGGLE PARA ELEGIR MODO DE EMPRESA */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Espacio de Trabajo</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsCrearEmpresa(false)}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${!isCrearEmpresa ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    Unirme a una Empresa
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCrearEmpresa(true)}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${isCrearEmpresa ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    Registrar Mi Empresa
                  </button>
                </div>
              </div>

              {/* RENDERIZADO CONDICIONAL DE EMPRESA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {!isCrearEmpresa ? (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Seleccione Empresa</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      <select
                        name="codigoEmpresa"
                        value={formData.codigoEmpresa}
                        onChange={handleChange}
                        required={!isCrearEmpresa}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-white text-gray-800 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px] appearance-none"
                      >
                        <option value="" disabled>Seleccione una empresa de la lista...</option>
                        {empresas.map((emp) => (
                          <option key={emp.codigoEmpresa} value={emp.codigoEmpresa}>
                            {emp.nombreEmpresa}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre de la Empresa</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="nombreEmpresa"
                          value={formData.nombreEmpresa}
                          onChange={handleChange}
                          required={isCrearEmpresa}
                          placeholder="Ej: TechCorp S.A."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">RUC de la Empresa</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="rucEmpresa"
                          value={formData.rucEmpresa}
                          onChange={handleChange}
                          required={isCrearEmpresa}
                          placeholder="13 dígitos"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Celular</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-bold w-4 h-4 flex items-center justify-center">#</span>
                    <input
                      type="tel"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      required
                      placeholder="099xxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-[#f1f5f9] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-transparent bg-[#f1f5f9] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-[13px] tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-[#2563eb] text-white rounded-full py-3.5 font-bold text-[14px] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 transition-colors shadow-lg shadow-blue-500/30"
                >
                  Registrarse
                </button>
              </div>

              <p className="text-center text-[12px] text-gray-500 mt-4 font-medium">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-bold text-[#0ea5e9] hover:text-[#0284c7] hover:underline transition-colors">
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