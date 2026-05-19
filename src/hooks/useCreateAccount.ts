import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export const useCreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    empresa: '',
    celular: '',
    password: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend register endpoint
    const payload = {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      cedula: formData.identificacion,
      correo: formData.correo,
      password: formData.password,
    };

    api.post('/api/auth/registerAccount/', payload)
      .then((res) => {
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 1200);
      })
      .catch((err) => {
        // Show error (basic)
        alert(err?.response?.mensaje || 'Error registrando usuario');
      });
  };

  return {
    formData,
    isSuccess,
    handleChange,
    handleSubmit
  };
};