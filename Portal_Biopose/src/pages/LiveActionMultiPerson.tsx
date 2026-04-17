import React, { useState } from 'react';
import { Camera, StopCircle, PlayCircle, AlertTriangle, Users } from 'lucide-react';

const LiveActionMultiPerson = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [operationMode, setOperationMode] = useState<string>('Modo Operativo (Por defecto)');
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección Multipersona en Vivo</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-700">Controles de Transmisión</h4>
          <p className="text-gray-500 text-sm">Gestiona la cámara y el análisis de interacciones.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleStream}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isStreaming ? (
              <>
                <StopCircle className="w-5 h-5 mr-2" />
                Detener
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" />
                Iniciar
              </>
            )}
          </button>

          <select
            value={operationMode}
            onChange={(e) => setOperationMode(e.target.value)}
            disabled={isStreaming}
            className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Modo Operativo (Por defecto)">Modo Operativo (Por defecto)</option>
            <option value="Modo Analítico (Esqueletos)">Modo Analítico (Esqueletos)</option>
            <option value="Modo Debug (Tracking)">Modo Debug (Tracking)</option>
          </select>

          <select
            value={poseMode}
            onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')}
            disabled={isStreaming}
            className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            <option value="2D">Estimación postural: 2D</option>
            <option value="3D">Estimación postural: 3D</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col h-full">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <Camera className="w-5 h-5 mr-2 text-indigo-500" />
              Vista de Cámara en Vivo
            </h4>
            <hr className="mb-4 border-gray-200" />
            
            <div className="flex-grow bg-gray-900 rounded-md flex items-center justify-center overflow-hidden min-h-[400px] relative">
              {isStreaming ? (
                <>
                  <div className="absolute top-4 right-4 flex items-center bg-black/50 px-2 py-1 rounded text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                    EN VIVO
                  </div>
                  <span className="text-white text-sm opacity-70">Transmisión de WebCam - Multipersona</span>
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center">
                  <Camera className="w-16 h-16 text-gray-600 mb-3 opacity-50" />
                  <p className="text-gray-400 italic">Cámara fuera de línea. Inicie la transmisión.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex-grow">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Detecciones e Interacciones
            </h4>
            <hr className="mb-4 border-gray-200" />
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 uppercase font-semibold">Personas en Escena</span>
                <p className="text-2xl font-bold mt-1 text-indigo-600">
                  {isStreaming ? '0' : '-'}
                </p>
              </div>

              {isStreaming && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <span className="text-xs text-red-500 uppercase font-semibold">Interacciones Clave</span>
                  <ul className="text-sm font-medium text-red-700 mt-2 list-disc pl-4">
                    <li>Esperando detecciones de peleas...</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveActionMultiPerson;