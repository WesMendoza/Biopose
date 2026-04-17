import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, ChevronDown, ChevronRight,
  FolderOpen, Image as ImageIcon, Film,
  UserCheck, Video, LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogout = () => {
    // Session clearing logic here
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 w-full pl-11 pr-4 py-2 text-sm transition-colors ${
      isActive ? 'bg-blue-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <nav className="w-72 bg-gray-900 text-white flex flex-col h-full shadow-lg transition-all duration-300">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">BioPose</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        <NavLink to="/dashboard" className={navLinkClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/users" className={navLinkClass}>
          <Users className="w-5 h-5" />
          <span>Gestión de Usuarios</span>
        </NavLink>

        {/* Pose Estimation Section */}
        <div>
          <button 
            onClick={() => toggleSection('pose')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${openSection === 'pose' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5" />
              <span>Estimación de posturas</span>
            </div>
            {openSection === 'pose' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openSection === 'pose' && (
            <div className="mt-1 space-y-1">
              <NavLink to="/pose/routes" className={subNavLinkClass}>
                <FolderOpen className="w-4 h-4" />
                <span>Configuración de rutas</span>
              </NavLink>
              <NavLink to="/pose/image" className={subNavLinkClass}>
                <ImageIcon className="w-4 h-4" />
                <span>Detección en imagen</span>
              </NavLink>
              <NavLink to="/pose/video" className={subNavLinkClass}>
                <Film className="w-4 h-4" />
                <span>Detección en video</span>
              </NavLink>
              <NavLink to="/pose/verify" className={subNavLinkClass}>
                <UserCheck className="w-4 h-4" />
                <span>Verifica tus imágenes</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Event Detection Section */}
        <div>
          <button 
            onClick={() => toggleSection('events')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${openSection === 'events' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5" />
              <span>Detección de eventos</span>
            </div>
            {openSection === 'events' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSection === 'events' && (
            <div className="mt-1 space-y-2 pb-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-11 mb-2 mt-3">
                Individual
              </div>
              <NavLink to="/events/individual/video" className={subNavLinkClass}>
                <Film className="w-4 h-4" />
                <span>Detección en video</span>
              </NavLink>
              <NavLink to="/events/individual/live" className={subNavLinkClass}>
                <Video className="w-4 h-4" />
                <span>Detección en vivo</span>
              </NavLink>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-11 mb-2 mt-4">
                Multipersonas
              </div>
              <NavLink to="/events/multi/video" className={subNavLinkClass}>
                <Film className="w-4 h-4" />
                <span>Detección en video</span>
              </NavLink>
              <NavLink to="/events/multi/live" className={subNavLinkClass}>
                <Video className="w-4 h-4" />
                <span>Detección en vivo</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;