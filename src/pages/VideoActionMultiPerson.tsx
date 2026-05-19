import React from 'react';
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, CloudUpload, Loader } from 'lucide-react';
import { useVideoActionMultiPerson } from '../hooks/useVideoActionMultiPerson';

const VideoActionMultiPerson = () => {
  const {
    file,
    videoUrl,
    isProcessing,
    progress,
    operationMode, setOperationMode,
    poseMode, setPoseMode,
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick
  } = useVideoActionMultiPerson();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección de Acciones Multipersona</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Cargar Video para Análisis</h4>
        <p className="text-gray-500 mb-6 text-sm">El sistema analizará el video en busca de acciones entre múltiples personas.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar archivo de video:
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 cursor-pointer border border-gray-300 rounded-md p-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleProcessVideo}
              disabled={!file || isProcessing}
              className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors
                ${(!file || isProcessing) ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Procesar video
            </button>

            <div className="flex items-center gap-2">
              <select
                value={operationMode}
                onChange={(e) => setOperationMode(e.target.value)}
                className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Modo Operativo (Por defecto)">Modo Operativo (Por defecto)</option>
                <option value="Modo Analítico (Esqueletos)">Modo Analítico (Esqueletos)</option>
                <option value="Modo Debug (Tracking)">Modo Debug (Tracking)</option>
              </select>

              <select
                value={poseMode}
                onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')}
                className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="2D">Estimación postural: 2D</option>
                <option value="3D">Estimación postural: 3D</option>
              </select>
            </div>

            <button
              onClick={handleReuploadClick}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Procesar nuevo video
            </button>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Procesando video... Esto puede tomar algunos minutos dependiendo del tamaño del video.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
            <CloudUpload className="w-5 h-5 mr-2 text-indigo-500" />
            Video Cargado
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="flex-grow bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative min-h-[300px]">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <CloudUpload className="w-16 h-16 text-gray-400 mb-3 opacity-50" />
                <p className="text-gray-500 italic">Cargue un video para procesar y continuar</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
            <Loader className={`w-5 h-5 mr-2 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`} />
            Video Procesado
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="flex-grow bg-gray-900 rounded-md flex items-center justify-center overflow-hidden min-h-[300px]">
            {progress === 100 && !isProcessing ? (
              <div className="text-center">
                <p className="text-green-400 mb-2 font-medium">Procesado Completo</p>
                <span className="text-white text-sm opacity-70">Resultado visualizado aquí...</span>
              </div>
            ) : isProcessing ? (
              <div className="text-center">
                <Loader className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-indigo-200 text-sm">Procesando {progress}%...</p>
              </div>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <p className="text-gray-500 italic">Procese el video cargado para continuar</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
          <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
          Información y Resultado
        </h4>
        <hr className="mb-4 border-gray-200" />
        <div className="bg-gray-50 p-4 rounded-md min-h-[100px] flex text-gray-700 text-sm flex-col">
          <p className="mb-2"><strong>Detecciones realizadas:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Peleas detectadas (Si aplica)</li>
            <li>Interacciones neutrales (Si aplica)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoActionMultiPerson;