import { useEffect } from 'react';

export const useDashboard = () => {
  const userName = 'Usuario'; // Opcional: podrías extraerlo de tu JWT como en otras pantallas

  useEffect(() => {
    // Animación automática de scroll (por si agregas la clase .reveal a algún elemento)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return {
    userName
  };
};