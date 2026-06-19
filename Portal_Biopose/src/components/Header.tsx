import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  // Iniciamos el estado vacío o con un texto por defecto
  const [userName, setUserName] = useState<string>('Usuario');

  useEffect(() => {
    // 1. Buscamos el token en la memoria del navegador
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // 2. Lo decodificamos
        const decoded: any = jwtDecode(token);
        
        // 3. Extraemos el nombre. 
        // IMPORTANTE: Cambia 'nombre' por la clave exacta que envíe tu backend de Django (ej. 'username', 'nombres', 'user')
        const nameToDisplay = decoded.nombre || decoded.username || decoded.nombres || 'Usuario';
        
        setUserName(nameToDisplay);
      } catch (error) {
        console.error("Error al leer el token en el Header:", error);
      }
    }
  }, []); // El array vacío asegura que esto solo se ejecute una vez al cargar el Header

  return (
    <header className="bg-white px-6 w-full h-16 shadow flex items-center justify-between text-gray-800">
      <div className="flex items-center">
        {/* Placeholder for left items if any */}
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-medium">
          Bienvenido, <span className="text-blue-600">{userName}</span>
        </p>
      </div>
    </header>
  );
};

export default Header;