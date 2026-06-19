import { AlertTriangle, CheckCircle, CloudUpload, Download, Loader, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useVideoDetection } from '../hooks/useVideoDetection';

// DICCIONARIO EXCLUSIVO PARA COMPORTAMIENTOS SOSPECHOSOS
const BEHAVIOR_LABELS: Record<string, { label: string, color: string }> = {
  'excessive_gaze': { label: 'Mirada excesiva', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'hidden_hands': { label: 'Manos ocultas detrás', color: 'bg-red-100 text-red-700 border-red-200' },
  'hand_under_clothes': { label: 'Mano bajo ropa', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const VideoDetection = () => {
  const {
    file,
    videoUrl,
    isProcessing,
    progress,
    mode,
    setMode,
    framesSkip,
    setFramesSkip,
    poseMode,
    setPoseMode,
    confidenceThreshold,
    setConfidenceThreshold,
    analysisResults,
    analysisReport,
    keypointsData,
    detailedDetections, // <--- AÑADIDO: Importamos la lista de detecciones del hook
    errorMessage,
    downloadUrl,
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick,
  } = useVideoDetection();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Obtiene las detecciones exactas para el segundo actual del video
  const getClosestDetections = () => {
    if (!keypointsData || !videoRef.current) return [];

    const currentTime = videoRef.current.currentTime;
    let minDiff = Infinity;
    let closestTime = -1;

    // Buscar el timestamp_sec del JSON que más se acerque al tiempo actual del video
    for (const frame of keypointsData) {
      const diff = Math.abs(frame.timestamp_sec - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = frame.timestamp_sec;
      }
    }

    // Si el video saltó mucho o se desincronizó por más de 0.5s, no dibujamos
    if (minDiff > 0.5) return [];

    // Retorna todos los registros (personas) que coincidan con ese tiempo
    return keypointsData.filter((frame: any) => frame.timestamp_sec === closestTime);
  };

  // 2. Dibuja los puntos y líneas sobre el canvas transparente
  const drawOverlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !keypointsData) return;

    // Sincronizar el tamaño interno del Canvas con la resolución intrínseca del video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpia el dibujo anterior
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!video.videoWidth || !video.videoHeight) return;

    // Los puntos del backend siempre vienen de un frame resizado a 640x640
    // Necesitamos escalarlos a la resolución original del video
    const scaleX = video.videoWidth / 640;
    const scaleY = video.videoHeight / 640;

    const currentDetections = getClosestDetections();

    currentDetections.forEach((person: any) => {
      const points = person.keypoints_json;
      if (!points) return;

      // Conexiones anatómicas del formato COCO (YOLO)
      const skeletonConnections = [
        [5, 7], [7, 9], [6, 8], [8, 10], // Brazos
        [11, 13], [13, 15], [12, 14], [14, 16], // Piernas
        [5, 6], [11, 12], [5, 11], [6, 12], // Torso central
        [0, 1], [0, 2], [1, 3], [2, 4] // Rostro
      ];

      // Dibujar líneas del esqueleto
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; // Verde esmeralda
      ctx.lineWidth = Math.max(video.videoWidth / 300, 2); // Grosor dinámico

      skeletonConnections.forEach(([p1, p2]) => {
        const pt1 = points.find((p: any) => p.id === p1);
        const pt2 = points.find((p: any) => p.id === p2);
        
        // Dibuja la línea solo si ambos puntos tienen buena confianza
        if (pt1 && pt2 && pt1.confidence > 0.4 && pt2.confidence > 0.4) {
          ctx.beginPath();
          ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
          ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
          ctx.stroke();
        }
      });

      // Dibujar las articulaciones (puntos rojos)
      points.forEach((point: any) => {
        if (point.confidence > 0.4) {
          ctx.beginPath();
          ctx.arc(point.x * scaleX, point.y * scaleY, Math.max(video.videoWidth / 250, 3), 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(239, 68, 68, 1)';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = Math.max(video.videoWidth / 500, 1);
          ctx.stroke();
        }
      });
    });
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
  const averageConfidence = analysisResults?.analysis_report?.average_confidence ?? analysisReport?.confianzaPromedio;

  // FILTRO: Solo nos interesan los comportamientos sospechosos en esta pantalla
  const allowedBehaviors = ['excessive_gaze', 'hidden_hands', 'hand_under_clothes'];
  const filteredDetections = (detailedDetections || []).filter((det: any) => 
    allowedBehaviors.includes(det.tipo_evento)
  );

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

          <div className="grid gap-3 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modo de procesamiento</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'operativo' | 'analitico' | 'debug')}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="operativo">Operativo</option>
                <option value="analitico">Analítico</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" title="Cambia el motor de Inteligencia Artificial">
                Dimensión (Motor IA)
              </label>
              <select
                value={poseMode}
                onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2D">2D (YOLOv8 - Multitudes)</option>
                <option value="3D">3D (MediaPipe - 1 Persona)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salto de frames (fps_skip)</label>
              <select
                value={framesSkip}
                onChange={(e) => setFramesSkip(Number(e.target.value))}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 de cada 1</option>
                <option value={2}>1 de cada 2</option>
                <option value={3}>1 de cada 3</option>
                <option value={4}>1 de cada 4</option>
                <option value={5}>1 de cada 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confianza mínima</label>
              <input
                type="number"
                min={0.1}
                max={1}
                step={0.05}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
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

            <button
              onClick={handleReuploadClick}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Procesar nuevo video
            </button>
          </div>

          <div className="flex items-center mt-3 text-amber-700 text-xs px-3 py-2 bg-amber-50 rounded border border-amber-200">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
            <span>Reducir el salto de frames aumenta la carga computacional y alarga los tiempos de espera.</span>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Procesando video... Esto puede tomar varios minutos.</p>
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

      {/* Video Preview Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loaded Video */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
            <CloudUpload className="w-5 h-5 mr-2 text-indigo-500" />
            Video Cargado
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="grow bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative min-h-[18.75rem]">
            {videoUrl ? (
              <video 
                src={videoUrl || undefined}
                controls 
                className="w-full h-full object-contain bg-black"
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center">
              <Loader className={`w-5 h-5 mr-2 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`} />
              Video Procesado
            </h4>
            {downloadUrl && (
              <a 
                href={downloadUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4 mr-1" /> Descargar
              </a>
            )}
          </div>
          <hr className="mb-4 border-gray-200" />
          
          <div className="grow bg-gray-900 rounded-md overflow-hidden min-h-[18.75rem] relative flex items-center justify-center">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={downloadUrl || videoUrl}
                  controls
                  onTimeUpdate={drawOverlay}
                  onLoadedMetadata={drawOverlay}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
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

            {isProcessing && videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                <div className="text-center text-white">
                  <Loader className="w-10 h-10 mx-auto animate-spin mb-3" />
                  <p className="text-sm">Procesando {progress}%...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Information and Results */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
          <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
          Información y Resultado
        </h4>
        <hr className="mb-4 border-gray-200" />

        {shouldShowResult ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Métricas del análisis</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Frames totales:</strong> {totalFrames ?? 'N/A'}</li>
                <li><strong>Duración (s):</strong> {durationSeconds ?? 'N/A'}</li>
                <li><strong>Tiempo de proceso (s):</strong> {processingSeconds ?? 'N/A'}</li>
                <li><strong>Actitudes sospechosas detectadas:</strong> {filteredDetections.length}</li>
                <li><strong>Confianza promedio:</strong> {averageConfidence ?? 'N/A'}</li>
              </ul>
            </div>
            
            {/* PANEL DERECHO: Lista interactiva de detecciones */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col h-full max-h-[300px]">
              <p className="text-sm font-bold text-gray-700 mb-2">Actitudes Detectadas (Clic para saltar)</p>
              
              <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
                {filteredDetections.length > 0 ? (
                  filteredDetections.map((det: any, index: number) => {
                    
                    const mins = Math.floor(det.segundo_inicio / 60).toString().padStart(2, '0');
                    const secs = Math.floor(det.segundo_inicio % 60).toString().padStart(2, '0');
                    const style = BEHAVIOR_LABELS[det.tipo_evento] || { label: det.tipo_evento, color: 'bg-gray-200 text-gray-700 border-gray-300' };

                    return (
                      <button 
                        key={index}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = det.segundo_inicio;
                            videoRef.current.play();
                          }
                        }}
                        className="w-full text-left bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-400 hover:shadow transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {mins}:{secs}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${style.color}`}>
                            {style.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-medium group-hover:text-indigo-500">
                          {(det.confianza * 100).toFixed(0)}% <span className="hidden sm:inline">confianza</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500 italic text-center px-4">
                    No se detectaron miradas excesivas ni manos ocultas.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md min-h-[6.25rem] flex items-center justify-center text-gray-500 italic">
            Los resultados del análisis de comportamiento aparecerán aquí cuando finalice el procesamiento.
          </div>
        )}

        {/* JSON de depuración oculto en un "details" para no ensuciar la UI */}
        {(analysisResults || analysisReport) && (
          <details className="mt-6 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-700">
            <summary className="p-3 font-semibold cursor-pointer hover:bg-gray-100">Ver JSON completo (Debug)</summary>
            <div className="p-4 border-t border-gray-200 overflow-auto max-h-64">
              <pre className="whitespace-pre-wrap">{JSON.stringify(analysisResults || analysisReport, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default VideoDetection;