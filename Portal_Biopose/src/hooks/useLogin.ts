import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import { useToast } from '../contexts/ToastContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      showToast('Por favor, ingresa tu correo y contraseña para continuar.', 'warning');
      return;
    }

    setLoading(true);

    // ==========================================
    // BYPASS: USUARIO QUEMADO PARA DESARROLLO
    // ==========================================
    if (email === 'admin@admin.com' && password === '12345') {
      // Simulamos un pequeño tiempo de carga de 1 segundo
      setTimeout(() => {
        // Guardamos un token falso en el localStorage
        localStorage.setItem('token', 'fake-jwt-token-bypass-desarrollo-12345');
        setLoading(false);
        showToast('Sesión iniciada correctamente', 'success');
        // Navegamos a la ruta protegida correcta
        navigate('/app/dashboard'); 
      }, 1000);
      return; // Evitamos que intente llamar al backend
    }
    // ==========================================

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password })
      });

      const data = await res.json();
      if (res.ok && data?.detalle?.token) {
        localStorage.setItem('token', data.detalle.token);
        showToast('Sesión iniciada correctamente', 'success');
        // Navegamos a la ruta protegida correcta
        navigate('/app/dashboard');
      } else {
        const errorMsg = data?.mensaje || 'Credenciales inválidas. Verifica tu correo y contraseña e intenta nuevamente.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg = 'No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleLogin
  };
};