import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, CloudUpload, Loader, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download, ZoomOut, ZoomIn, Maximize, User, Info, AlertCircle } from 'lucide-react';
import { useGenerarImagenes } from '../hooks/useGenerarImagenes';
import { KEYPOINT_NAMES, POSE_CONNECTIONS } from '../utils/ai-visuals'; 
import videoGif from '../assets/video.gif';
import bannerImg from '../assets/Banner_video.png';

const GenerarImagenes = () => {
  const {
    file, videoUrl, fps, setFps, width, setWidth, height, setHeight,
    isProcessing, isDownloading, isModalOpen, setIsModalOpen,
    keypointsData, setKeypointsData, resultsData, fileInputRef,
    handleFileChange, handleGenerateImages, handleReuploadClick,
    handleSaveResults
  } = useGenerarImagenes();

  const [currentIndex, setCurrentIndex] = useState(0);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedKp, setDraggedKp] = useState<number | null>(null);
  const [selectedKp, setSelectedKp] = useState<number | null>(null);
  const [videoSize, setVideoSize] = useState({ w: 640, h: 640 });
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number>(0);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStartPan, setDragStartPan] = useState({ x: 0, y: 0 });

  useEffect(() => { 
    if (isModalOpen) {
      setCurrentIndex(0); 
    }
  }, [isModalOpen]);

  const drawFrameWithSkeletons = useCallback(() => {
    const video = hiddenVideoRef.current;
    const canvas = displayCanvasRef.current;
    if (!video || !canvas || keypointsData.length === 0) return;

    const currentFrame = keypointsData[currentIndex];
    const timeInSeconds = currentFrame.timestamp_sec ?? currentFrame.time ?? 0;

    const handleSeeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      setVideoSize({ w: video.videoWidth, h: video.videoHeight });
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.removeEventListener('seeked', handleSeeked);
    };

    video.addEventListener('seeked', handleSeeked);
    video.currentTime = timeInSeconds;
  }, [currentIndex, keypointsData]);

  useEffect(() => {
    if (isModalOpen && hiddenVideoRef.current && hiddenVideoRef.current.readyState >= 2) drawFrameWithSkeletons();
  }, [currentIndex, isModalOpen, drawFrameWithSkeletons]);


  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (draggedKp !== null || zoom <= 1) return;
    setIsDraggingPan(true);
    setDragStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveSVG = (e: React.MouseEvent) => {
    if (draggedKp !== null && svgRef.current) {
      e.stopPropagation();
      const svg = svgRef.current as any;
      const CTM = svg.getScreenCTM();
      if (!CTM) return;
      
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(CTM.inverse());

      setKeypointsData((prev: any[]) => {
        const newData = [...prev];
        const frameData = { ...newData[currentIndex] };

        let rawPoints = frameData.persons?.[0]?.keypoints_json || frameData.keypoints_json || frameData.keypoints || [];
        let pointsArray = Array.isArray(rawPoints) && rawPoints.length > 0 && Array.isArray(rawPoints[0]) ? rawPoints[0] : rawPoints;

        const isNormalized = pointsArray.length > 0 && pointsArray.every((p: any) => p.x <= 1.5 && p.y <= 1.5);

        const ptToUpdate = pointsArray.find((p: any) => p.id === draggedKp);
        if (ptToUpdate) {
          if (isNormalized) {
              ptToUpdate.x = svgP.x / videoSize.w;
              ptToUpdate.y = svgP.y / videoSize.h;
          } else {
              const scaleX = videoSize.w / 640;
              const scaleY = videoSize.h / 640;
              ptToUpdate.x = svgP.x / scaleX;
              ptToUpdate.y = svgP.y / scaleY;
          }
          ptToUpdate.confidence = 1.0; 
        }

        if (frameData.persons && frameData.persons.length > 0) {
            frameData.persons[0].keypoints_json = pointsArray;
        } else if (frameData.keypoints_json) {
            if (Array.isArray(frameData.keypoints_json) && Array.isArray(frameData.keypoints_json[0])) frameData.keypoints_json[0] = pointsArray;
            else frameData.keypoints_json = pointsArray;
        } else {
            if (Array.isArray(frameData.keypoints) && Array.isArray(frameData.keypoints[0])) frameData.keypoints[0] = pointsArray;
            else frameData.keypoints = pointsArray;
        }

        newData[currentIndex] = frameData;
        return newData;
      });
      return;
    }

    if (!isDraggingPan) return;
    setPan({ x: e.clientX - dragStartPan.x, y: e.clientY - dragStartPan.y });
  };

  const handleMouseUp = () => {
    setIsDraggingPan(false);
    setDraggedKp(null);
  };

  const currentFrameData = keypointsData[currentIndex] || {};
  const rawP = currentFrameData.persons?.[0]?.keypoints_json || currentFrameData.keypoints_json || currentFrameData.keypoints || [];
  const validKeypoints = Array.isArray(rawP) && rawP.length > 0 && Array.isArray(rawP[0]) ? rawP[0] : rawP;
  
  const isNormalized = validKeypoints.length > 0 && validKeypoints.every((p: any) => p.x <= 1.5 && p.y <= 1.5);
  const scaleX = isNormalized ? videoSize.w : (videoSize.w / 640);
  const scaleY = isNormalized ? videoSize.h : (videoSize.h / 640);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col lg:flex-row gap-8 lg:min-h-[calc(100vh-8rem)]">
        
        {/* COLUMNA IZQUIERDA (Título + Banner) */}
        <div className="lg:w-1/3 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Generación de Imágenes (Video)</h1>
        
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative shrink-0 group min-h-[300px] flex-grow">
            <img src={bannerImg} alt="Banner Image" className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent flex flex-col justify-end p-8">
               <h2 className="text-2xl xl:text-3xl font-bold text-white mb-3">Procesamiento de Video</h2>
               <p className="text-indigo-100 text-sm leading-relaxed">
                 Sube un video para que la Inteligencia Artificial extraiga el esqueleto corporal de cada fotograma (FPS). Obtendrás un dataset unificado con todas las posiciones clave detectadas a lo largo de la grabación.
               </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL (COLUMNAS DERECHAS) */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="hidden lg:block h-[56px] shrink-0" aria-hidden="true"></div>
          
          <div className="flex-grow flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4"><Settings className="w-5 h-5 mr-2 text-indigo-500" /> Configuración de Extracción</h4>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes por Segundo (FPS):</label>
              <input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} min="1" max="24" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <p className="text-sm text-indigo-800 mb-3">Tu imagen será redimensionada a: <strong>{width} X {height}</strong></p>
              <select onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); setWidth(w); setHeight(h); }} className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-md focus:ring-indigo-500" value={`${width}x${height}`}>
                <optgroup label="Vertical"><option value="175x260">175 X 260</option><option value="225x334">225 X 334</option><option value="300x445">300 X 445</option></optgroup>
                <optgroup label="Horizontal"><option value="250x167">250 X 167</option><option value="300x200">300 X 200</option><option value="350x233">350 X 233</option></optgroup>
                <optgroup label="Cuadrada"><option value="250x250">250 X 250</option><option value="300x300">300 X 300</option><option value="350x350">350 X 350</option></optgroup>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center"><CloudUpload className="w-5 h-5 mr-2 text-indigo-500" /> Carga de Video</h4>
            {videoUrl && (<button onClick={handleReuploadClick} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center"><RefreshCw className="w-4 h-4 mr-1" /> Nuevo video</button>)}
          </div>
          <hr className="mb-4 border-gray-200" />
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
              <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              {videoUrl ? (
                <div className="flex flex-col items-center"><video src={videoUrl} className="h-32 mb-4 rounded bg-black" /><p className="text-sm font-medium text-indigo-600">{file?.name}</p></div>
              ) : (
                <div className="flex flex-col items-center">
                  <img src={videoGif} alt="Upload Video" className="w-20 h-20 mb-3 opacity-80 mix-blend-multiply" />
                  <p className="text-gray-600 font-medium">Arrastra y suelta tu video aquí</p>
                </div>
              )}
            </div>
            {videoUrl && (
              <button onClick={handleGenerateImages} disabled={isProcessing} className="mt-6 w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50">
                {isProcessing ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <ImageIcon className="w-5 h-5 mr-2" />}
                {isProcessing ? 'Procesando...' : 'Obtener Imágenes'}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] flex flex-col h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
              <h5 className="text-xl font-bold text-slate-800 flex items-center">Análisis Biométrico (Video) <span className="ml-4 text-xs font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded">Puedes arrastrar los puntos para corregirlos</span></h5>
              <button onClick={handleReuploadClick} className="text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
              <div 
                className="lg:w-3/5 relative bg-[#0f172a] overflow-hidden flex items-center justify-center border-r border-gray-200"
                onMouseDown={handleMouseDownPan} onMouseMove={handleMouseMoveSVG} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              >
                <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-slate-200/50 overflow-hidden">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2.5 hover:bg-slate-100 text-slate-600 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                  <div className="px-3 py-2 border-x border-slate-200/50 text-sm font-bold text-slate-700 flex items-center justify-center bg-slate-50/50 min-w-[4rem]">{Math.round(zoom * 100)}%</div>
                  <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="p-2.5 hover:bg-slate-100 text-slate-600 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                  <button onClick={handleResetView} className="p-2.5 hover:bg-slate-100 text-indigo-600 transition-colors border-l border-slate-200/50"><Maximize className="w-5 h-5" /></button>
                </div>

                <div 
                  className="relative origin-center inline-block"
                  style={{ 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    cursor: draggedKp !== null ? 'grabbing' : (zoom > 1 ? (isDraggingPan ? 'grabbing' : 'grab') : 'default'),
                    transitionProperty: 'transform', transitionDuration: isDraggingPan || draggedKp !== null ? '0ms' : '200ms', transitionTimingFunction: 'ease-out'
                  }}
                >
                  {videoUrl && (<video ref={hiddenVideoRef} src={videoUrl} className="hidden" onLoadedMetadata={drawFrameWithSkeletons} />)}

                  {keypointsData && keypointsData.length > 0 && (
                    <div className="relative w-full h-full flex items-center justify-center" style={{ maxHeight: '85vh' }}>
                      <canvas ref={displayCanvasRef} className="block max-w-none shadow-2xl rounded-sm pointer-events-none select-none" />
                      
                      <svg 
                        ref={svgRef}
                        viewBox={`0 0 ${videoSize.w} ${videoSize.h}`} 
                        className="absolute inset-0 w-full h-full"
                      >
                        {POSE_CONNECTIONS.map((connection, idx) => {
                          const kp1 = validKeypoints.find((k: any) => k.id === connection.pair[0]);
                          const kp2 = validKeypoints.find((k: any) => k.id === connection.pair[1]);
                          if (kp1?.confidence !== undefined && kp1.confidence >= 0 && kp2?.confidence !== undefined && kp2.confidence >= 0) {
                            return <line key={`bone-${idx}`} x1={kp1.x * scaleX} y1={kp1.y * scaleY} x2={kp2.x * scaleX} y2={kp2.y * scaleY} stroke={connection.color} strokeWidth={Math.max(videoSize.w / 300, 2)} strokeOpacity="0.85" />;
                          }
                          return null;
                        })}

                        {validKeypoints.map((kp: any) => {
                          if (kp.confidence !== undefined && kp.confidence >= 0) {
                            return (
                              <circle 
                                key={`joint-${kp.id}`} 
                                cx={kp.x * scaleX} cy={kp.y * scaleY} 
                                r={Math.max(videoSize.w / 1000, 1.5)} 
                                fill={selectedKp === kp.id ? "#ef4444" : "#0ea5e9"} 
                                stroke="#ffffff" 
                                strokeWidth={Math.max(videoSize.w / 1000, 1)} 
                                className={`${isDownloading ? 'cursor-not-allowed' : 'cursor-pointer hover:fill-yellow-400'} transition-colors`}
                                onMouseDown={(e) => { 
                                  e.stopPropagation(); 
                                  if (isDownloading) return;
                                  setDraggedKp(kp.id); 
                                  setSelectedKp(kp.id); 
                                }} 
                              />
                            );
                          }
                          return null;
                        })}

                        {selectedKp !== null && validKeypoints.filter((k: any) => k.id === selectedKp).map((kp: any) => (
                          <g key={`radar-${kp.id}`}>
                            <circle cx={kp.x * scaleX} cy={kp.y * scaleY} r={Math.max(videoSize.w / 40, 15)} className="animate-ping origin-center" fill="none" stroke="#ef4444" strokeWidth={Math.max(videoSize.w / 200, 2)} />
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>

                <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => p - 1); }} disabled={currentIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-20 transition-all z-30 shadow-lg backdrop-blur-sm"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => p + 1); }} disabled={currentIndex === keypointsData.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-20 transition-all z-30 shadow-lg backdrop-blur-sm"><ChevronRight className="w-6 h-6" /></button>
              </div>
              
              <div className="lg:w-2/5 flex flex-col bg-white overflow-hidden shrink-0">
                <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0">
                  <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center"><Info className="w-4 h-4 mr-2" /> Datos Generales</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-600">
                    <p className="flex justify-between"><span>Sujetos Detectados:</span> <strong className="text-slate-800">1</strong></p>
                    <p className="flex justify-between"><span>Total Fotogramas:</span> <strong className="text-slate-800">{keypointsData.length}</strong></p>
                    <p className="flex justify-between"><span>Fotograma Actual:</span> <strong className="text-slate-800">{currentIndex + 1} de {keypointsData.length}</strong></p>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50/80 border border-blue-100 rounded-lg flex items-start shadow-sm">
                    <Info className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Nota:</strong> El valor de la confianza es generado en el análisis inicial del video y no cambia aunque se modifiquen las coordenadas manualmente.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border-b border-slate-200 px-6 pt-4 pb-0 shrink-0 shadow-inner">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center mb-3"><User className="w-4 h-4 mr-2 text-indigo-500" /> Sujetos Detectados</h3>
                  <div className="flex overflow-x-auto gap-2 pb-3">
                    <button className="px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-b-2 bg-white text-indigo-700 border-indigo-600 shadow-sm">Persona 1</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar bg-slate-50/30">
                  {validKeypoints.length > 0 ? (
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Puntos de Articulación</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                        {validKeypoints.map((kp: any) => (
                          <div key={kp.id} onClick={() => setSelectedKp(kp.id)} className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${selectedKp === kp.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-slate-700 hover:bg-indigo-50 border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-[13px]">{KEYPOINT_NAMES[kp.id] || `Punto ${kp.id}`}</span>
                              {kp.confidence !== undefined && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedKp === kp.id ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>{(kp.confidence * 100).toFixed(0)}%</span>}
                            </div>
                            <span className={`text-[11px] font-medium ${selectedKp === kp.id ? 'text-indigo-200' : 'text-slate-400'}`}>X: {Math.round(kp.x * scaleX)} | Y: {Math.round(kp.y * scaleY)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (<div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-700 flex items-start shadow-sm"><AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" /><p>No hay articulaciones visibles.</p></div>)}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-200 shrink-0">
                    <button className="flex-1 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-bold transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100" onClick={handleReuploadClick} disabled={isDownloading}>Descartar y Cerrar</button>
                    <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-lg text-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed" onClick={handleSaveResults} disabled={isDownloading}>
                      {isDownloading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      {isDownloading ? 'Preparando ZIP...' : 'Descargar Fotogramas (ZIP)'}
                    </button>
                  </div>
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