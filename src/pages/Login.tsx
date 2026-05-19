import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    handleLogin
  } = useLogin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-12 sm:px-24 md:px-32 lg:px-40 xl:px-48 bg-white shadow-2xl z-10">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Inicia Sesión</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-8"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/create-account" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-50 items-center justify-center relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-gray-900 pointer-events-none"></div>
        
        <div className="text-center z-10 p-12">
          <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">BioPose</h1>
          <p className="text-xl text-blue-800 font-medium">Análisis de movimiento avanzado</p>
        </div>
      </div>
    </div>
  );
};

export default Login;