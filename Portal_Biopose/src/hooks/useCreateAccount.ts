import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // Simulate API call to create account
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return {
    formData,
    isSuccess,
    handleChange,
    handleSubmit
  };
};