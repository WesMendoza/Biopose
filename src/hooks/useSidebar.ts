import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebar = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    `flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
      isActive ? 'bg-blue-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    } ${isSidebarOpen ? 'pl-11' : 'justify-center'}`;

  return {
    openSection,
    isSidebarOpen,
    toggleSection,
    toggleSidebar,
    handleLogout,
    navLinkClass,
    subNavLinkClass
  };
};
