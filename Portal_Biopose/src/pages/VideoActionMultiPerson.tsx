import React, { useRef, useEffect } from 'react';
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, CloudUpload, Loader, Download } from 'lucide-react';
import { useVideoActionMultiPerson } from '../hooks/useVideoActionMultiPerson';

// DICCIONARIO PARA COMPORTAMIENTOS MULTIPERSONA
const MULTIPERSON_LABELS: Record<string, { label: string, color: string }> = {
  'PELEAR': { label: 'Pelea Detectada', color: 'bg-red-100 text-red-800 border-red-300' },
  'DISTURBIO': { label: 'Disturbio / Altercado', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'FIGHT': { label: 'Pelea Detectada', color: 'bg-red-100 text-red-800 border-red-300' },
  'DISTURBANCE': { label: 'Disturbio / Altercado', color: 'bg-orange-100 text-orange-800 border-orange-300' },
};

const VideoActionMultiPerson = () => {
  const {
    file, videoUrl, isProcessing, progress, mode, setMode, framesSkip, setFramesSkip,
    poseMode, setPoseMode, confidenceThreshold, setConfidenceThreshold,
    downloadUrl, analysisResults, analysisReport, keypointsData,
    detailedDetections, errorMessage, fileInputRef, handleFileChange, handleProcessVideo,
    handleReuploadClick
  } = useVideoActionMultiPerson();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getClosestDetections = () => {
    if (!videoRef.current || !keypointsData || !Array.isArray(keypointsData)) return [];
    const currentTime = videoRef.current.currentTime;
    let minDiff = Infinity;
    let closestTime = -1;

    for (const frame of keypointsData) {
      if (frame && frame.timestamp_sec !== undefined) {
        const diff = Math.abs(frame.timestamp_sec - currentTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestTime = frame.timestamp_sec;
        }
      }
    }
    if (minDiff > 0.5) return [];
    return keypointsData.filter((frame: any) => frame.timestamp_sec === closestTime);
  };

  // =========================================================================
  // MAGIA MULTIPERSONA CON CAJAS DELIMITADORAS Y ETIQUETAS
  // =========================================================================
 const drawOverlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !keypointsData || !Array.isArray(keypointsData)) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!video.videoWidth || !video.videoHeight) return;

    const scaleX = video.videoWidth / 640;
    const scaleY = video.videoHeight / 640;
    const currentTime = video.currentTime;

    // Buscamos el frame actual en el array 'frames'
    const currentFrame = keypointsData.find((f: any) => Math.abs(f.timestamp_sec - currentTime) < 0.2);
    if (!currentFrame || !currentFrame.persons) return;

    const allowedBehaviors = ['PELEAR', 'DISTURBIO', 'FIGHT', 'DISTURBANCE'];
    
    // Evaluamos la alerta global de la escena
    const activeEvent = (detailedDetections || []).find((det: any) => 
      allowedBehaviors.includes(det.tipo_evento?.toUpperCase()) &&
      currentTime >= det.segundo_inicio && currentTime <= (det.segundo_fin + 2.0)
    );

    const isHostile = !!activeEvent;
    const boxColor = isHostile ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
    const boxBgColor = isHostile ? 'rgba(239, 68, 68, 0.2)' : 'transparent'; 

    // DIBUJAR A TODAS LAS PERSONAS DETECTADAS EN LA PANTALLA
    currentFrame.persons.forEach((personData: any) => {
      const personPoints = personData.keypoints_json;
      if (!Array.isArray(personPoints)) return;

      let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

      const skeletonConnections = [
        [5, 7], [7, 9], [6, 8], [8, 10], [11, 13], [13, 15], [12, 14], [14, 16], 
        [5, 6], [11, 12], [5, 11], [6, 12], [0, 1], [0, 2], [1, 3], [2, 4] 
      ];

      ctx.strokeStyle = isHostile ? 'rgba(239, 68, 68, 0.8)' : 'rgba(14, 165, 233, 0.8)';
      ctx.lineWidth = Math.max(video.videoWidth / 300, 2); 

      skeletonConnections.forEach(([p1, p2]) => {
        const pt1 = personPoints.find((p: any) => p.id === p1);
        const pt2 = personPoints.find((p: any) => p.id === p2);
        
        if (pt1 && pt2 && pt1.confidence > 0.4 && pt2.confidence > 0.4) {
          ctx.beginPath();
          ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
          ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
          ctx.stroke();
        }
      });

      personPoints.forEach((point: any) => {
        if (point.confidence > 0.4) {
          const px = point.x * scaleX;
          const py = point.y * scaleY;
          if (px < minX) minX = px;
          if (py < minY) minY = py;
          if (px > maxX) maxX = px;
          if (py > maxY) maxY = py;

          ctx.beginPath();
          ctx.arc(px, py, Math.max(video.videoWidth / 250, 3), 0, 2 * Math.PI);
          ctx.fillStyle = isHostile ? 'rgba(255, 255, 255, 1)' : 'rgba(234, 179, 8, 1)';
          ctx.fill();
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = Math.max(video.videoWidth / 500, 1);
          ctx.stroke();
        }
      });

      // Dibujar caja contenedora
      if (minX < Infinity && maxX > 0) {
        const padding = 20; 
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 3;
        ctx.fillStyle = boxBgColor;
        ctx.fillRect(minX - padding, minY - padding, (maxX - minX) + padding * 2, (maxY - minY) + padding * 2);
        ctx.strokeRect(minX - padding, minY - padding, (maxX - minX) + padding * 2, (maxY - minY) + padding * 2);
      }
    });

    // MARCA DE ALERTA GLOBAL EN LA ESQUINA (Idéntico a tu sistema antiguo)
    if (isHostile) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(20, 20, 240, 50);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.max(video.videoWidth / 40, 18)}px Arial`;
        ctx.fillText(`⚠️ ${activeEvent.tipo_evento.toUpperCase()}`, 35, 52);
    }
  };

  useEffect(() => {
    if (!keypointsData) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    drawOverlay();
  }, [keypointsData]);

  const shouldShowResult = !!analysisResults || !!analysisReport;
  const totalFrames = analysisResults?.total_frames ?? analysisReport?.totalFrames;
  const durationSeconds = analysisResults?.duration_seconds ?? analysisReport?.totalDuracionSegundos;
  const processingSeconds = analysisResults?.processing_time_seconds ?? analysisReport?.tiempoProcesamientoSegundos;

  const allowedBehaviors = ['PELEAR', 'DISTURBIO', 'FIGHT', 'DISTURBANCE'];
  const filteredDetections = (detailedDetections || []).filter((det: any) =>
    allowedBehaviors.includes(det.tipo_evento?.toUpperCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección de Acciones Multipersona</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Cargar Video para Análisis</h4>
        <p className="text-gray-500 mb-6 text-sm">El sistema analizará el video en busca de interacciones hostiles entre múltiples personas.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar archivo de video:</label>
            <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-300 rounded-md p-1" />
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modo de procesamiento</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as 'operativo' | 'analitico' | 'debug')} className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="operativo">Operativo (Recomendado)</option>
                <option value="analitico">Analítico</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensión (Motor IA)</label>
              <select value={poseMode} onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')} className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="2D">2D (YOLOv8 - Multitudes)</option>
                <option value="3D">3D (MediaPipe - Cercanía)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salto de frames</label>
              <select value={framesSkip} onChange={(e) => setFramesSkip(Number(e.target.value))} className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={1}>1 de cada 1</option>
                <option value={3}>1 de cada 3</option>
                <option value={5}>1 de cada 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confianza mínima</label>
              <input type="number" min={0.1} max={1} step={0.05} value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))} className="w-full px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleProcessVideo} disabled={!file || isProcessing} className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors ${(!file || isProcessing) ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
              <CheckCircle className="w-4 h-4 mr-2" /> Procesar video
            </button>
            <button onClick={handleReuploadClick} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors ml-auto">
              <RefreshCw className="w-4 h-4 mr-2" /> Limpiar y procesar nuevo
            </button>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Procesando video de multitudes...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3"><CloudUpload className="w-5 h-5 mr-2 text-indigo-500" /> Video Cargado</h4>
          <hr className="mb-4 border-gray-200" />
          <div className="grow bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative min-h-[18.75rem]">
            {videoUrl ? (
              <video src={videoUrl || undefined} controls className="w-full h-full object-contain bg-black" />
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <CloudUpload className="w-16 h-16 text-gray-400 mb-3 opacity-50" />
                <p className="text-gray-500 italic">Cargue un video para procesar y continuar</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center"><Loader className={`w-5 h-5 mr-2 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`} /> Video Procesado</h4>
            {downloadUrl && (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                <Download className="w-4 h-4 mr-1" /> Descargar
              </a>
            )}
          </div>
          <hr className="mb-4 border-gray-200" />
          <div className="grow bg-gray-900 rounded-md overflow-hidden min-h-[18.75rem] relative flex items-center justify-center">
            {videoUrl ? (
              <>
                <video ref={videoRef} src={downloadUrl || videoUrl} controls onTimeUpdate={drawOverlay} onLoadedMetadata={drawOverlay} className="absolute inset-0 w-full h-full object-contain bg-black" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              </>
            ) : isProcessing ? (
              <div className="text-center flex items-center justify-center h-full">
                <Loader className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-indigo-200 text-sm">Procesando {progress}%...</p>
              </div>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <p className="text-gray-500 italic">Procese el video cargado para ver la vista resultante.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3"><AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" /> Información y Resultado</h4>
        <hr className="mb-4 border-gray-200" />

        {shouldShowResult ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Métricas del análisis</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Frames totales:</strong> {totalFrames ?? 'N/A'}</li>
                <li><strong>Duración (s):</strong> {durationSeconds ?? 'N/A'}</li>
                <li><strong>Tiempo de proceso (s):</strong> {processingSeconds ?? 'N/A'}</li>
                <li><strong>Eventos de Pelea/Disturbio:</strong> {filteredDetections.length}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col h-full max-h-[300px]">
              <p className="text-sm font-bold text-gray-700 mb-2">Peleas / Disturbios Detectados</p>
              <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
                {filteredDetections.length > 0 ? (
                  filteredDetections.map((det: any, index: number) => {
                    const mins = Math.floor(det.segundo_inicio / 60).toString().padStart(2, '0');
                    const secs = Math.floor(det.segundo_inicio % 60).toString().padStart(2, '0');
                    const style = MULTIPERSON_LABELS[det.tipo_evento?.toUpperCase()] || { label: det.tipo_evento, color: 'bg-gray-200 text-gray-700 border-gray-300' };

                    return (
                      <button key={index} onClick={() => { if (videoRef.current) { videoRef.current.currentTime = det.segundo_inicio; videoRef.current.play(); } }} className="w-full text-left bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-red-400 hover:shadow transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{mins}:{secs}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${style.color}`}>{style.label}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{(det.confianza * 100).toFixed(0)}% <span className="hidden sm:inline">confianza</span></div>
                      </button>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500 italic text-center px-4">
                    No se detectaron peleas ni disturbios en este video.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md min-h-[100px] flex items-center justify-center text-gray-500 italic">
            Los resultados del análisis de comportamiento aparecerán aquí cuando finalice el procesamiento.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoActionMultiPerson;