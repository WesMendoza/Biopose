import React, { useState, useRef } from 'react';
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, CloudUpload, Loader } from 'lucide-react';

const VideoDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
    }
  };

  const handleProcessVideo = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const handleReuploadClick = () => {
    setFile(null);
    setVideoUrl(null);
    setIsProcessing(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección de Comportamientos Sospechosos</h1>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Cargar Video para Análisis</h4>
        <p className="text-gray-500 mb-6 text-sm">El sistema analizará el video en busca de comportamientos sospechosos.</p>

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
                value={framesSkip}
                onChange={(e) => setFramesSkip(Number(e.target.value))}
                className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Sin saltos de frames</option>
                <option value={1}>1 frame</option>
                <option value={2}>2 frames</option>
                <option value={3}>3 frames (Por defecto)</option>
                <option value={4}>4 frames</option>
                <option value={5}>5 frames</option>
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

          <div className="flex items-center mt-3 text-amber-700 text-xs px-3 py-2 bg-amber-50 rounded border border-amber-200">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>¡Aviso! Reducir o quitar el salto de frames aumenta la carga computacional y alarga los tiempos de espera.</span>
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

      {/* Video Preview Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loaded Video */}
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

        {/* Processed Video */}
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
                {/* Normally an img tag displaying stream or final video */}
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
      
      {/* Information and Results (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
          <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
          Información y Resultado
        </h4>
        <hr className="mb-4 border-gray-200" />
        <div className="bg-gray-50 p-4 rounded-md min-h-[100px] flex items-center justify-center text-gray-500 text-sm">
          Los resultados del análisis de comportamiento sospechoso aparecerán aquí.
        </div>
      </div>
    </div>
  );
};

export default VideoDetection;