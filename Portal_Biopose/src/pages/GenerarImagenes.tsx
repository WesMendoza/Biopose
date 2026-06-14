import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, 
  CloudUpload, Loader, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download 
} from 'lucide-react';
import { useGenerarImagenes } from '../hooks/useGenerarImagenes';

const GenerarImagenes = () => {
  const {
    file, videoUrl, fps, setFps, width, setWidth, height, setHeight,
    isProcessing, isModalOpen, setIsModalOpen,
    keypointsData, resultsData, fileInputRef,
    handleFileChange, handleGenerateImages, handleReuploadClick,
    selectedPath, setSelectedPath, paths, handleSaveResults // <-- AGREGAR AQUÍ
  } = useGenerarImagenes();

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Referencias para la extracción mágica en el frontend
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (keypointsData && keypointsData.length > 0) setCurrentIndex(0);
  }, [keypointsData]);

  // MOTOR DE EXTRACCIÓN Y DIBUJO (Se dispara cuando cambia el índice)
  const drawFrameWithSkeletons = useCallback(() => {
    const video = hiddenVideoRef.current;
    const canvas = displayCanvasRef.current;
    if (!video || !canvas || keypointsData.length === 0) return;

    const currentFrame = keypointsData[currentIndex];
    const timeInSeconds = currentFrame.timestamp_sec ?? currentFrame.time ?? 0;

    // Cuando el video salte al tiempo indicado, dibujamos todo
    const handleSeeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Dibujar el fotograma del video original
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 2. Extraer puntos y calcular escala
      const rawPoints = currentFrame.keypoints_json || currentFrame.keypoints || [];
      const points = Array.isArray(rawPoints) && rawPoints.length > 0 && Array.isArray(rawPoints[0]) ? rawPoints[0] : rawPoints;
      if (!Array.isArray(points) || points.length === 0) return;

      const isNormalized = points.every((p: any) => p.x <= 1.5 && p.y <= 1.5);
      const scaleX = isNormalized ? canvas.width : (canvas.width / 640);
      const scaleY = isNormalized ? canvas.height : (canvas.height / 640);

      // 3. Dibujar Esqueleto
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = Math.max(3, canvas.width / 250);
      
      const pairs = [[0,1],[1,3],[0,2],[2,4],[5,6],[5,11],[6,12],[11,12],[5,7],[7,9],[6,8],[8,10],[11,13],[13,15],[12,14],[14,16]];
      
      pairs.forEach(([i, j]) => {
        const p1 = points.find((p: any) => p.id === i);
        const p2 = points.find((p: any) => p.id === j);
        if (p1?.confidence > 0.3 && p2?.confidence > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
          ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
          ctx.stroke();
        }
      });

      // 4. Dibujar Nodos
      points.forEach((pt: any) => {
        if (pt.confidence > 0.3) {
          ctx.beginPath();
          ctx.arc(pt.x * scaleX, pt.y * scaleY, Math.max(4, canvas.width / 200), 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
        }
      });

      video.removeEventListener('seeked', handleSeeked);
    };

    video.addEventListener('seeked', handleSeeked);
    video.currentTime = timeInSeconds;

  }, [currentIndex, keypointsData]);

  // Forzar el dibujado cuando cambie la foto o se abra el modal
  useEffect(() => {
    if (isModalOpen && hiddenVideoRef.current && hiddenVideoRef.current.readyState >= 2) {
      drawFrameWithSkeletons();
    }
  }, [currentIndex, isModalOpen, drawFrameWithSkeletons]);

  // Función de descarga rediseñada para respetar el redimensionamiento del usuario
  const handleDownloadFrame = () => {
    const sourceCanvas = displayCanvasRef.current;
    if (sourceCanvas && keypointsData.length > 0) {
      const currentFrame = keypointsData[currentIndex];
      
      // Creamos un canvas temporal con las medidas que el usuario eligió en el panel
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext('2d');
      
      if (exportCtx) {
        // Redimensionamos la imagen final estirándola a la nueva resolución
        exportCtx.drawImage(sourceCanvas, 0, 0, width, height);
        
        const link = document.createElement('a');
        link.href = exportCanvas.toDataURL('image/jpeg', 0.9);
        link.download = `frame_${currentFrame.frame_index || currentIndex}_${currentFrame.timestamp_sec || 0}s_${width}x${height}.jpg`;
        link.click();
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Generación de Imágenes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel - COMPLETAMENTE RESTAURADO */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-indigo-500" />
            Configuración de Extracción
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Elije la ruta de guardado:</label>
                <select 
                  value={selectedPath} 
                  onChange={(e) => setSelectedPath(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona una carpeta...</option>
                  {paths.length > 0 ? (
                    paths.map((route: any) => (
                      <option key={route.codigo} value={route.valor}>
                        {route.valor}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay rutas disponibles</option>
                  )}
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes por Segundo (FPS):</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <p className="text-sm text-indigo-800 mb-3">
                Tu imagen será redimensionada a: <strong>{width} X {height}</strong>
              </p>
              
              <div className="space-y-3">
                <select 
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setWidth(w); setHeight(h);
                  }}
                  className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-md focus:ring-indigo-500"
                >
                  <optgroup label="Vertical">
                    <option value="175x260">175 X 260</option>
                    <option value="225x334">225 X 334</option>
                    <option value="300x445">300 X 445</option>
                  </optgroup>
                  <optgroup label="Horizontal">
                    <option value="250x167">250 X 167</option>
                    <option value="300x200">300 X 200</option>
                    <option value="350x233">350 X 233</option>
                  </optgroup>
                  <optgroup label="Cuadrada">
                    <option value="250x250">250 X 250</option>
                    <option value="300x300">300 X 300</option>
                    <option value="350x350">350 X 350</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center">
              <CloudUpload className="w-5 h-5 mr-2 text-indigo-500" />
              Carga de Video
            </h4>
            {videoUrl && (
              <button onClick={handleReuploadClick} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center">
                <RefreshCw className="w-4 h-4 mr-1" /> Nuevo video
              </button>
            )}
          </div>
          <hr className="mb-4 border-gray-200" />
          
          <div className="flex-grow flex flex-col justify-center items-center">
            <div 
              className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              {videoUrl ? (
                <div className="flex flex-col items-center">
                  <video src={videoUrl} className="h-32 mb-4 rounded bg-black" />
                  <p className="text-sm font-medium text-indigo-600">{file?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CloudUpload className="w-12 h-12 text-indigo-400 mb-3" />
                  <p className="text-gray-600 font-medium">Arrastra y suelta tu video aquí</p>
                  <p className="text-gray-400 text-sm mt-1">o haz clic para seleccionar</p>
                </div>
              )}
            </div>

            {videoUrl && (
              <button
                onClick={handleGenerateImages}
                disabled={isProcessing}
                className="mt-6 w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5 mr-2" />
                )}
                {isProcessing ? 'Procesando...' : 'Obtener Imágenes'}
              </button>
            )}

            <div className="flex items-center mt-4 w-full text-amber-700 text-xs px-3 py-2 bg-amber-50 rounded border border-amber-200">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span><strong>Importante:</strong> Todos tus videos serán procesados según los FPS indicados.</span>
            </div>
          </div>
        </div>
      </div>

      {/* GALERÍA MÁGICA CON EL VIDEO FANTASMA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Fotogramas Extraídos</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto flex flex-col lg:flex-row gap-6">
              
              {/* Visor de imágenes (Canvas) */}
              <div className="lg:w-2/3 flex flex-col items-center justify-center bg-gray-900 rounded-md min-h-[400px] border border-gray-200 relative overflow-hidden">
                
                {/* VIDEO FANTASMA: Carga el archivo pero no se ve en pantalla */}
                {videoUrl && (
                  <video 
                    ref={hiddenVideoRef} 
                    src={videoUrl} 
                    className="hidden" 
                    onLoadedMetadata={drawFrameWithSkeletons}
                  />
                )}

                {keypointsData && keypointsData.length > 0 ? (
                  <>
                    <canvas ref={displayCanvasRef} className="w-full h-full object-contain" />
                    
                    <button 
                      onClick={() => setCurrentIndex(p => p - 1)} 
                      disabled={currentIndex === 0} 
                      className="absolute left-4 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-20 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button 
                      onClick={() => setCurrentIndex(p => p + 1)} 
                      disabled={currentIndex === keypointsData.length - 1} 
                      className="absolute right-4 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-20 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400">No se encontraron poses.</p>
                )}
              </div>
              
              {/* Panel de Información Lateral */}
              <div className="lg:w-1/3 flex flex-col">
                <h3 className="font-semibold text-gray-700 mb-4">Detalles de Extracción</h3>
                
                {resultsData && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-6">
                    <p className="text-sm text-blue-800 mb-2"><strong>Total fotogramas:</strong> {keypointsData.length}</p>
                    <p className="text-sm text-blue-800 mb-2"><strong>FPS Solicitados:</strong> {fps}</p>
                    <p className="text-sm text-blue-800"><strong>Duración:</strong> {resultsData.duration_seconds || resultsData.duration || 0} segundos</p>
                  </div>
                )}

                {keypointsData && keypointsData.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-700 mb-2 font-semibold">Fotograma Actual:</p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>N°:</strong> {currentIndex + 1} de {keypointsData.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Marca de tiempo:</strong> {keypointsData[currentIndex].timestamp_sec}s
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={handleSaveResults} // <-- CAMBIADO A handleSaveResults
                  disabled={!keypointsData || keypointsData.length === 0} 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <CloudUpload className="w-5 h-5" /> Guardar Colección (JSON + Imágenes)
                </button>
                
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-full py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md font-medium transition-colors"
                >
                  Cerrar Galería
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerarImagenes;