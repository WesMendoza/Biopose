import { useState, useEffect } from 'react';

export const useDashboard = () => {
  const [showTutorialModal, setShowTutorialModal] = useState(true);
  const userName = 'Usuario'; // Could be derived from auth state later

  useEffect(() => {
    const isConfigured = localStorage.getItem('tutorialCompleted');
    if (isConfigured) {
      setShowTutorialModal(false);
    }

    // Animación automática de scroll
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

  const saveFirstTutorial = () => {
    setShowTutorialModal(false);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  return {
    showTutorialModal,
    userName,
    saveFirstTutorial
  };
};