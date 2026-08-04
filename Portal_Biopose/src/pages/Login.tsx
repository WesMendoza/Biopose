import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';

// Importación de tus assets
import logoImg from '../assets/logotipo.png';
import banner1 from '../assets/bannerLogin1.png';
import banner2 from '../assets/bannerLogin2.webp';
import banner3 from '../assets/bannerlogin3.webp';

const Login = () => {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleLogin
  } = useLogin();

  const [currentImage, setCurrentImage] = useState(0);

										
  const banners = [banner1, banner2, banner3];

															   
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  return (
    // Fondo azul marino profundo (combinando con el Sidebar)
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#0f172a] p-4 sm:p-8 relative overflow-hidden">
      
      {/* Brillo celeste de fondo para que no sea totalmente plano */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0ea5e9] opacity-[0.08] rounded-full blur-[120px] pointer-events-none"></div>



      {/* --- CONTENEDOR PRINCIPAL TIPO TARJETA --- */}
      <div className="w-full max-w-[1400px] min-h-[600px] flex flex-col lg:flex-row bg-white rounded-[2rem] overflow-hidden shadow-2xl relative z-10">
        
        {/* --- LADO IZQUIERDO: SLIDER DE IMÁGENES --- */}
																	 
        <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
          {banners.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Banner BioPose ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Capa azul oscuro semitransparente sobre las fotos */}
          <div className="absolute inset-0 bg-[#0f172a]/40 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* --- LADO DERECHO: FORMULARIO BLANCO --- */}
        <div className="w-full lg:w-1/2 p-10 sm:p-14 md:p-16 flex flex-col justify-center relative">
          
          <div className="max-w-[380px] w-full mx-auto">
											
            <div className="flex justify-center mb-6">
              <img src={logoImg} alt="BioPose Logo" className="w-70 object-contain" />
            </div>

            <h2 className="text-[28px] font-extrabold text-gray-900 mb-10 text-center tracking-tight">
              Inicia Sesión
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
			  
								  
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wide" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  className="w-full px-5 py-3.5 rounded-xl border border-transparent bg-[#f1f5f9] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all text-sm"
                />
              </div>

									   
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wide" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-transparent bg-[#f1f5f9] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all text-sm tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0ea5e9] focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

											
              <button
                type="submit"
                className="w-full bg-[#2563eb] text-white rounded-full py-4 mt-8 font-bold text-[15px] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 transition-colors shadow-lg shadow-blue-500/30"
              >
                Ingresar
              </button>
            </form>

											   
            <div className="mt-8 text-center text-[13px] text-gray-500 font-medium">
              ¿No tienes cuenta?{' '}
              <Link to="/create-account" className="font-bold text-[#0ea5e9] hover:text-[#0284c7] hover:underline transition-colors">
                Regístrate
              </Link>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;