import { NavLink } from 'react-router-dom';
import { 
  Home, Users, ChevronDown, ChevronRight,
  FolderOpen, Image as ImageIcon, Film,
  UserCheck, Video, LogOut, Menu, X
} from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar';

const Sidebar = () => {
  const {
    openSection,
    isSidebarOpen,
    toggleSection,
    toggleSidebar,
    handleLogout,
    navLinkClass,
    subNavLinkClass
  } = useSidebar();

  return (
    <>
      {/* Botón flotante para reabrir cuando está cerrado */}
      {!isSidebarOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors shadow-lg"
          title="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Menú Sidebar */}
      <nav className={`bg-gray-900 text-white flex flex-col h-screen shadow-lg transition-all duration-300 z-40 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className={`flex items-center h-20 border-b border-gray-800 px-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && <h1 className="text-2xl font-bold tracking-wider text-blue-400">BioPose</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
            title={isSidebarOpen ? "Contraer menú" : "Expandir menú"}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 overflow-x-hidden">
          <NavLink to="/dashboard" className={navLinkClass} title="Home">
            <Home className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Home</span>}
          </NavLink>

          <NavLink to="/users" className={navLinkClass} title="Gestión de Usuarios">
            <Users className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Gestión de Usuarios</span>}
          </NavLink>

          {/* Pose Estimation Section */}
          <div>
            <button 
              onClick={() => toggleSection('pose')}
              title="Estimación de posturas"
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${openSection === 'pose' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'} ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span>Estimación de posturas</span>}
              </div>
              {isSidebarOpen && (openSection === 'pose' ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />)}
            </button>
            
            {openSection === 'pose' && (
              <div className="mt-1 space-y-1">
                <NavLink to="/pose/routes" className={subNavLinkClass} title="Configuración de rutas">
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Configuración de rutas</span>}
                </NavLink>
                <NavLink to="/pose/image" className={subNavLinkClass} title="Detección en imagen">
                  <ImageIcon className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en imagen</span>}
                </NavLink>
                <NavLink to="/pose/video" className={subNavLinkClass} title="Detección en video">
                  <Film className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en video</span>}
                </NavLink>
                <NavLink to="/pose/verify" className={subNavLinkClass} title="Verifica tus imágenes">
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Verifica tus imágenes</span>}
                </NavLink>
              </div>
            )}
          </div>

          {/* Event Detection Section */}
          <div>
            <button 
              onClick={() => toggleSection('events')}
              title="Detección de eventos"
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${openSection === 'events' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'} ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span>Detección de eventos</span>}
              </div>
              {isSidebarOpen && (openSection === 'events' ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />)}
            </button>

            {openSection === 'events' && (
              <div className="mt-1 space-y-2 pb-2">
                {isSidebarOpen && (
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-11 mb-2 mt-3">
                    Individual
                  </div>
                )}
                <NavLink to="/events/individual/video" className={subNavLinkClass} title="Detección en video (Individual)">
                  <Film className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en video</span>}
                </NavLink>
                <NavLink to="/events/individual/live" className={subNavLinkClass} title="Detección en vivo (Individual)">
                  <Video className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en vivo</span>}
                </NavLink>

                {isSidebarOpen && (
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-11 mb-2 mt-4">
                    Multipersonas
                  </div>
                )}
                <NavLink to="/events/multi/video" className={subNavLinkClass} title="Detección en video (Multipersona)">
                  <Film className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en video</span>}
                </NavLink>
                <NavLink to="/events/multi/live" className={subNavLinkClass} title="Detección en vivo (Multipersona)">
                  <Video className="w-4 h-4 flex-shrink-0" />
                  {isSidebarOpen && <span>Detección en vivo</span>}
                </NavLink>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            title="Cerrar Sesión"
            className={`flex items-center space-x-3 w-full py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;