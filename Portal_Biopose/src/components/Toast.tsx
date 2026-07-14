import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  // Configuración visual según el tipo de Toast
  const config = {
    error: {
      bg: 'bg-red-600/95',
      border: 'border-red-500',
      icon: <AlertCircle className="w-5 h-5 text-white" />,
    },
    success: {
      bg: 'bg-green-600/95',
      border: 'border-green-500',
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    warning: {
      bg: 'bg-amber-500/95',
      border: 'border-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: 'bg-blue-600/95',
      border: 'border-blue-500',
      icon: <Info className="w-5 h-5 text-white" />,
    },
  };

  const currentConfig = config[type] || config.info;

  // Auto close después de 4 segundos
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div 
      className={`fixed top-6 right-6 z-50 flex items-center w-full max-w-sm p-4 text-white ${currentConfig.bg} backdrop-blur-sm rounded-lg shadow-2xl border ${currentConfig.border} transition-all duration-500 transform ${
        show ? 'translate-y-0 opacity-100 visible' : '-translate-y-10 opacity-0 invisible'
      }`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg">
        {currentConfig.icon}
      </div>
      <div className="ml-3 text-sm font-medium mr-4 leading-snug">{message}</div>
      <button 
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white hover:bg-white/20 rounded-lg focus:ring-2 focus:ring-white p-1.5 inline-flex h-8 w-8 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
