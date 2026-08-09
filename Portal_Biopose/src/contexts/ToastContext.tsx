import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const showToast = (newMessage: string, newType: ToastType = 'info') => {
    setMessage(newMessage);
    setType(newType);
    setShow(true);
  };

  const closeToast = () => {
    setShow(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast show={show} message={message} type={type} onClose={closeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};
