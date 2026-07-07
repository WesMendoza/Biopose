import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, CloudUpload, Download, Loader, RefreshCw, Info } from 'lucide-react';
import policeImg from '../assets/police.jpg';
import angryPoliceImg from '../assets/angry_police.jpg';
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
  const [isHostile, setIsHostile] = useState(false);

  // Cuando se limpia el video o no hay resultados, reseteamos la alerta
  useEffect(() => {
    if (!videoUrl || !analysisResults) {
      setIsHostile(false);
    }
  }, [videoUrl, analysisResults]);

  // Mapeamos para soportar tanto los nombres antiguos como los nuevos del backend
  const normalizedDetections = (detailedDetections || []).map((det: any) => ({
    ...det,
    tipo_evento: det.tipo_evento ?? det.label ?? det.behavior ?? det.tipo ?? 'UNKNOWN',
    segundo_inicio: det.segundo_inicio ?? det.inicio_segundo ?? det.start_time ?? 0,
    segundo_fin: det.segundo_fin ?? det.fin_segundo ?? det.end_time ?? 0,
    confianza: det.confianza ?? det.precision_maxima ?? det.confidence ?? 0,
  }));

  const shouldShowResult = !!analysisResults || !!analysisReport;
  const totalFrames = analysisResults?.total_frames ?? analysisReport?.totalFrames;
  const durationSeconds = analysisResults?.duration_seconds ?? analysisReport?.totalDuracionSegundos;
  const processingSeconds = analysisResults?.processing_time_seconds ?? analysisReport?.tiempoProcesamientoSegundos;

  const allowedBehaviors = ['PELEAR', 'DISTURBIO', 'FIGHT', 'DISTURBANCE'];
  const filteredDetections = normalizedDetections.filter((det: any) =>
    allowedBehaviors.includes(det.tipo_evento?.toUpperCase())
  );

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
    const currentFrame = keypointsData.find((f: any) => Math.abs((f.timestamp_sec ?? f.time ?? 0) - currentTime) < 0.2);
    
    // Encontrar TODOS los eventos activos en este momento (añadimos solo 0.5s de gracia para evitar superposiciones largas)
    const activeEvents = filteredDetections.filter((det: any) => 
      currentTime >= det.segundo_inicio && currentTime <= ((det.segundo_fin || det.segundo_inicio) + 0.5)
    );
    
    // El evento principal activo será el más reciente para la alerta global (policía en la UI)
    const activeEvent = [...activeEvents].sort((a: any, b: any) => b.segundo_inicio - a.segundo_inicio)[0];

    const currentlyHostile = !!activeEvent;
    // Actualizamos el estado para la imagen del policía (si cambió)
    setIsHostile(currentlyHostile);

    if (!currentFrame || !currentFrame.persons) return;

    // DIBUJAR A TODAS LAS PERSONAS DETECTADAS EN LA PANTALLA
    currentFrame.persons.forEach((personData: any) => {
      const personPoints = personData.keypoints_json || personData.keypoints;
      if (!Array.isArray(personPoints)) return;
      const pid = personData.person_id;

      // Evaluar en qué evento está participando ESTA persona específicamente
      const personEvents = activeEvents.filter((e: any) => {
        const pids = e.detalles?.pids || (e.detalles?.pid !== undefined ? [e.detalles.pid] : []);
        // Si el backend no envió pids o si está incluido, aplicamos el evento (fallback)
        return pids.length === 0 || pids.includes(pid);
      });

      const isPeleando = personEvents.some((e: any) => (e.tipo_evento || '').toLowerCase().includes('pelea'));
      const isDisturbio = personEvents.some((e: any) => (e.tipo_evento || '').toLowerCase().includes('disturbio') || (e.tipo_evento || '').toLowerCase().includes('altercado'));

      let boxColor = 'rgba(34, 197, 94, 1)'; // Verde (Neutral)
      let boxBgColor = 'transparent';
      let skeletonColor = 'rgba(34, 197, 94, 0.8)'; // Verde
      let pointColor = 'rgba(34, 197, 94, 1)'; // Verde

      if (isPeleando) {
        boxColor = 'rgba(239, 68, 68, 1)'; // Rojo
        boxBgColor = 'rgba(239, 68, 68, 0.2)';
        skeletonColor = 'rgba(239, 68, 68, 0.8)';
        pointColor = 'rgba(255, 255, 255, 1)';
      } else if (isDisturbio) {
        boxColor = 'rgba(249, 115, 22, 1)'; // Naranja
        boxBgColor = 'rgba(249, 115, 22, 0.2)';
        skeletonColor = 'rgba(249, 115, 22, 0.8)';
        pointColor = 'rgba(255, 255, 255, 1)';
      }

      let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

      const skeletonConnections = [
        [5, 7], [7, 9], [6, 8], [8, 10], [11, 13], [13, 15], [12, 14], [14, 16], 
        [5, 6], [11, 12], [5, 11], [6, 12], [0, 1], [0, 2], [1, 3], [2, 4] 
      ];

      ctx.strokeStyle = skeletonColor;
      ctx.lineWidth = Math.max(video.videoWidth / 300, 2); 

      skeletonConnections.forEach(([p1, p2]) => {
        const pt1 = personPoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === p1 || p.id === p1);
        const pt2 = personPoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === p2 || p.id === p2);
        
        const pt1Conf = pt1?.confidence ?? 1.0;
        const pt2Conf = pt2?.confidence ?? 1.0;

        if (pt1 && pt2 && pt1Conf > 0.4 && pt2Conf > 0.4) {
          ctx.beginPath();
          ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
          ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
          ctx.stroke();
        }
      });

      personPoints.forEach((point: any) => {
        const conf = point.confidence ?? 1.0;
        if (conf > 0.4) {
          const px = point.x * scaleX;
          const py = point.y * scaleY;
          if (px < minX) minX = px;
          if (py < minY) minY = py;
          if (px > maxX) maxX = px;
          if (py > maxY) maxY = py;

          ctx.beginPath();
          ctx.arc(px, py, Math.max(video.videoWidth / 250, 3), 0, 2 * Math.PI);
          ctx.fillStyle = pointColor;
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

    // MARCA DE ALERTA GLOBAL EN LA ESQUINA (Dinámico y apilable)
    if (activeEvents.length > 0) {
      let startY = 20;
      // Ordenamos para que Pelea siempre salga arriba si hay varios, o simplemente los listamos
      const displayEvents = [...activeEvents].sort((a: any, b: any) => {
        if ((a.tipo_evento || '').toLowerCase().includes('pelea')) return -1;
        return 1;
      });

      displayEvents.forEach((evt: any) => {
        const typeStr = (evt.tipo_evento || '').toLowerCase();
        const isDisturbio = typeStr.includes('disturbio') || typeStr.includes('altercado');
        
        const fontSize = Math.max(video.videoWidth / 45, 16);
        ctx.font = `bold ${fontSize}px Arial`;
        const textStr = `⚠️ ${evt.tipo_evento.toUpperCase()}`;
        const textWidth = ctx.measureText(textStr).width;
        
        const paddingX = 15;
        const paddingY = 10;
        const boxHeight = fontSize + paddingY * 2;
        
        ctx.fillStyle = isDisturbio ? 'rgba(249, 115, 22, 0.9)' : 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(20, startY, textWidth + paddingX * 2, boxHeight);
        
        ctx.fillStyle = 'white';
        // 0.85 de fontSize es un buen aproximado para alinear la línea base de texto
        ctx.fillText(textStr, 20 + paddingX, startY + paddingY + fontSize * 0.85);
        
        startY += boxHeight + 10; // Espaciado entre etiquetas si hay varias
      });
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección de Acciones Multipersona</h1>

      <div className="w-full mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Cargar Video para Análisis</h4>
          <p className="text-gray-500 mb-6 text-sm">El sistema analizará el video en busca de interacciones hostiles entre múltiples personas.</p>

          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar archivo de video:</label>
            <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-300 rounded-md p-1" />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center relative group w-max">
                Modo de procesamiento
                <Info className="w-4 h-4 ml-1 text-indigo-500 cursor-pointer" />
                <div className="absolute bottom-full mb-2 left-0 sm:left-1/2 transform sm:-translate-x-1/2 hidden group-hover:block w-72 bg-gray-800 text-white text-xs rounded-md p-3 shadow-lg z-50 pointer-events-none">
                  <ul className="space-y-2">
                    <li><span className="font-semibold text-indigo-300">Operativo:</span> Prioriza velocidad. Aplica salto de frames y usa sustracción de fondo.</li>
                    <li><span className="font-semibold text-indigo-300">Analítico:</span> Prioriza precisión. Ignora salto de frames pero omite pausas estáticas.</li>
                    <li><span className="font-semibold text-indigo-300">Debug:</span> Análisis exhaustivo. Desactiva sustracción de fondo, procesa todo lentamente.</li>
                  </ul>
                </div>
              </label>
              <select value={mode} onChange={(e) => setMode(e.target.value as 'operativo' | 'analitico' | 'debug')} className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="operativo">Operativo (Recomendado)</option>
                <option value="analitico">Analítico</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center relative group w-max">
                Salto de frames
                <Info className="w-4 h-4 ml-1 text-indigo-500 cursor-pointer" />
                <div className="absolute bottom-full mb-2 left-0 sm:left-1/2 transform sm:-translate-x-1/2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded-md p-3 shadow-lg z-50 pointer-events-none">
                  Dicta qué tan rápido procesa el video saltándose fotogramas (ideal para videos largos).
                </div>
              </label>
              <select value={framesSkip} onChange={(e) => setFramesSkip(Number(e.target.value))} className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={1}>1 de cada 1</option>
                <option value={3}>1 de cada 3</option>
                <option value={5}>1 de cada 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center relative group w-max">
                Confianza mínima
                <Info className="w-4 h-4 ml-1 text-indigo-500 cursor-pointer" />
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-[80%] sm:-translate-x-1/2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded-md p-3 shadow-lg z-50 pointer-events-none">
                  Filtro para evitar falsos positivos. Valores más altos son más estrictos.
                </div>
              </label>
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
          <div className="flex items-center mt-3 text-amber-700 text-xs px-3 py-2 bg-amber-50 rounded border border-amber-200">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
             <span>Reducir el salto de frames aumenta la carga computacional y alarga los tiempos de espera.</span>
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
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" /> Información y Resultado</h4>
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${isHostile ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {isHostile ? '¡Alerta Activa!' : 'Todo en orden'}
            </span>
            <img src={isHostile ? angryPoliceImg : policeImg} alt="Estado" className={`w-12 h-12 rounded-full border-2 transition-all ${isHostile ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-green-500'}`} />
          </div>
        </div>
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
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${style.color}`}>
                            {style.label}
                          </span>
                          <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {mins}:{secs}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Confianza</p>
                          <p className="text-sm font-bold text-indigo-600">{(det.confianza * 100).toFixed(1)}%</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-sm text-gray-500 italic text-center px-4">
                    <p>No se detectaron peleas ni disturbios en este video.</p>
                    <pre className="text-xs text-left w-full mt-4 overflow-auto bg-gray-100 border border-gray-300 p-2 text-black not-italic font-mono">
                      DEBUG: {JSON.stringify(normalizedDetections.slice(0, 3), null, 2)}
                    </pre>
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

export default VideoActionMultiPerson;