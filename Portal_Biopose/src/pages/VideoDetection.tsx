import { AlertTriangle, CheckCircle, CloudUpload, Download, Loader, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useVideoDetection } from '../hooks/useVideoDetection';

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

    // Alinea el canvas al tamaño visual del video en la pantalla
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpia el dibujo anterior
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!video.videoWidth || !video.videoHeight) return;

    // Escala para mapear las coordenadas originales a la resolución actual de la pantalla
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

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
      ctx.lineWidth = 2.5;
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
          const x = point.x * scaleX;
          const y = point.y * scaleY;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(239, 68, 68, 1)';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5;
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
  const totalDetections = analysisResults?.analysis_report?.total_detections ?? analysisReport?.totalEventos;
  const averageConfidence = analysisResults?.analysis_report?.average_confidence ?? analysisReport?.confianzaPromedio;
  const detectionsByType = analysisResults?.analysis_report?.detections_by_type ?? analysisReport?.estadisticas?.detections_by_type;

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensión</label>
              <select
                value={poseMode}
                onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
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
          
          <div className="grow bg-gray-900 rounded-md overflow-hidden min-h-[18.75rem] relative">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={downloadUrl || videoUrl}
                  controls
                  onTimeUpdate={drawOverlay}
                  onLoadedMetadata={drawOverlay}
                  className="w-full h-full object-contain bg-black"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
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
                <li><strong>Detecciones totales:</strong> {totalDetections ?? 'N/A'}</li>
                <li><strong>Confianza promedio:</strong> {averageConfidence ?? 'N/A'}</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Desglose de detecciones</p>
              {detectionsByType ? (
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 bg-white rounded p-3 overflow-x-auto">{JSON.stringify(detectionsByType, null, 2)}</pre>
              ) : (
                <p className="text-sm text-gray-500">No hay desgloses disponibles.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md min-h-[6.25rem] flex items-center justify-center text-gray-500 italic">
            Los resultados del análisis de comportamiento aparecerán aquí cuando finalice el procesamiento.
          </div>
        )}

        {(analysisResults || analysisReport) && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md border border-gray-200 text-xs text-gray-700 overflow-auto">
            <p className="font-semibold mb-2">JSON completo de respuesta:</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(analysisResults || analysisReport, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetection;