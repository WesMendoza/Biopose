import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';

// Importación de tus assets
import mediapipe from '../assets/mediapipe.png';
import Openpose from '../assets/Openpose.png';
import yolo from '../assets/yolo.png';

const Dashboard = () => {
  const { userName } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* --- SECCIÓN 1: HERO (Qué es BoiPose) --- */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            ¿Qué es <span className="text-blue-600">BioPose?</span>
          </h1>
          <h3 className="text-2xl font-semibold text-slate-600">
            Estimación de poses humanas
          </h3>
          <p className="text-lg text-slate-500 leading-relaxed">
            BioPose utiliza como base <strong>MediaPipe</strong> para estimar las diferentes poses 
            del cuerpo humano y generar 14 keypoints como puntos claves al realizar la estimación con altísima precisión.
          </p>
        </div>
        <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 transform hover:scale-[1.02] transition-transform duration-500">
          <img 
            src="https://aihub.qualcomm.com/_next/image?url=https%3A%2F%2Fqaihub-public-assets.s3.us-west-2.amazonaws.com%2Fqai-hub-models%2Fmodels%2Fopenpose%2Fweb-assets%2Fmodel_demo.png&w=1920&q=75" 
            alt="Demo OpenPose" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* --- SECCIÓN 2: LO QUE PUEDES LOGRAR (Estilo Neón Oscuro) --- */}
      <section className="bg-slate-900 py-20 px-6 mt-8 rounded-[3rem] mx-4 md:mx-10 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-sky-400 mb-16 text-4xl tracking-wide">
            Lo que puedes lograr, {userName}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tarjeta 1: Rosa (Configuración Personalizada) */}
            <Link 
              to="/app/pose/routes" 
              className="group flex items-center justify-center min-h-[160px] bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-pink-500/70 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:-translate-y-2 transition-all duration-300"
            >
              <h4 className="text-white font-semibold text-xl text-center px-6 group-hover:text-pink-100">
                Configuración Personalizada
              </h4>
            </Link>

            {/* Tarjeta 2: Morado (Detección en Imágenes / Generar Imágenes) */}
            <Link 
              to="/app/pose/video" 
              className="group flex items-center justify-center min-h-[160px] bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-indigo-500/70 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-2 transition-all duration-300"
            >
              <h4 className="text-white font-semibold text-xl text-center px-6 group-hover:text-indigo-100">
                Detección en Imágenes
              </h4>
            </Link>

            {/* Tarjeta 3: Cyan (Detección en Videos Multi-persona) */}
            <Link 
              to="/app/events/multi/video" 
              className="group flex items-center justify-center min-h-[160px] bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-cyan-400/70 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-2 transition-all duration-300"
            >
              <h4 className="text-white font-semibold text-xl text-center px-6 group-hover:text-cyan-100">
                Detección en Videos
              </h4>
            </Link>

          </div>
        </div>
      </section>

     {/* --- SECCIÓN 3: TACÓMETROS CENTRADOS --- */}
      <section className="max-w-6xl mx-auto px-6 mt-24 mb-12">
        {/* Contenedor blanco con altura ajustada (min-h-[280px]) */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 flex flex-col lg:flex-row items-center min-h-[280px]">
          
          {/* Caja Azul Izquierda */}
          <div className="w-full lg:w-1/3 bg-[#1d4ed8] rounded-3xl h-full flex items-center justify-center p-8 shadow-lg shadow-blue-600/30 transform hover:scale-[1.02] transition-transform">
            <h2 className="text-[26px] font-bold text-white leading-snug text-center lg:text-left">
              Tiempos de respuesta más rápidos con MediaPipe
            </h2>
          </div>

          {/* Contenedor de Tacómetros Centrados */}
          <div className="w-full lg:w-2/3 flex flex-row justify-center items-center gap-6 md:gap-14 mt-8 lg:mt-0">
            
            {/* OpenPose */}
            <div className="flex flex-col items-center transform hover:-translate-y-2 transition-transform">
              <img src={Openpose} alt="OpenPose" className="w-24 md:w-28 object-contain mb-3 drop-shadow-md" />
              <h2 className="text-[15px] font-semibold text-slate-600">OpenPose</h2>
            </div>
            
            {/* MediaPipe (El más grande) */}
            <div className="flex flex-col items-center transform hover:-translate-y-2 transition-transform scale-110 lg:scale-125 z-10 mx-2">
              <img src={mediapipe} alt="MediaPipe" className="w-32 md:w-40 object-contain mb-2 drop-shadow-xl" />
              {/* ¡AQUÍ ESTÁ LA ETIQUETA QUE FALTABA! */}
              <h2 className="text-[16px] font-bold text-slate-700">MediaPipe</h2>
            </div>
            
            {/* Yolo */}
            <div className="flex flex-col items-center transform hover:-translate-y-2 transition-transform">
              <img src={yolo} alt="Yolo" className="w-24 md:w-28 object-contain mb-3 drop-shadow-md" />
              <h2 className="text-[15px] font-semibold text-slate-600">Yolo</h2>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;