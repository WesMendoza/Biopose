import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoute?: string;
}

const ProtectedRoute = ({ children, requiredRoute }: ProtectedRouteProps) => {
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAcceso = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAccesoPermitido(false);
        return;
      }
      if (!requiredRoute) {
        setAccesoPermitido(true);
        return;
      }
      try {
        const decoded: any = jwtDecode(token);
        const idUsuario = decoded.idUsuario;

        const cacheKey = `rutas_${idUsuario}`;
        const cachedRutas = sessionStorage.getItem(cacheKey);
        let rutasPermitidas: string[] = [];

        if (cachedRutas) {
          rutasPermitidas = JSON.parse(cachedRutas);
        } else {
          const res = await api.get(`/api/menuOpciones/opciones/usuario/${idUsuario}/`);
          const detalle = res?.detalle || res || [];
          rutasPermitidas = detalle.map((item: any) => item.ruta);
          sessionStorage.setItem(cacheKey, JSON.stringify(rutasPermitidas));
        }

        if (rutasPermitidas.includes(requiredRoute)) {
          setAccesoPermitido(true);
        } else {
          setAccesoPermitido(false);
        }
      } catch (error) {
        console.error("Error validando permisos de ruta:", error);
        setAccesoPermitido(false);
      }
    };

    verificarAcceso();
  }, [requiredRoute]);
  if (accesoPermitido === null) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (accesoPermitido === false) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;