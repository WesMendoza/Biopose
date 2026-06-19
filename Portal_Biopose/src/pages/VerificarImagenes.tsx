import React, { useState, useRef } from 'react';
import { Search, AlertCircle, Image as ImageIcon, ZoomIn, ZoomOut, Maximize, User, Info, Loader, FolderOpen } from 'lucide-react';
import { useVerificarImagenes } from '../hooks/useVerificarImagenes';
// IMPORTAMOS LA CONFIGURACIÓN CENTRALIZADA
import { KEYPOINT_NAMES, POSE_CONNECTIONS } from '../utils/ai-visuals';

const VerificarImagenes = () => {
  const {
    folderName, selectedFile, setSelectedFile,
    imageUrl, errorFile, setErrorFile,
    availableFiles, poseResults, setPoseResults, isLoading, 
    handleLoadImage, handleFolderSelect, folderInputRef
  } = useVerificarImagenes();

  const [selectedKp, setSelectedKp] = useState<number | null>(null);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number>(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedKp, setDraggedKp] = useState<number | null>(null);

  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // === LÓGICA DE ARRASTRE Y CONFIANZA AL 100% ===
    if (draggedKp !== null && svgRef.current) {
      e.stopPropagation();
      const svg = svgRef.current as any;
      const CTM = svg.getScreenCTM();
      if (!CTM) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(CTM.inverse());
      
      setPoseResults((prev: any) => {
        const newRes = { ...prev };
        const person = newRes.persons[selectedPersonIndex];
        const kpIndex = person.keypoints.findIndex((k: any) => k.id === draggedKp);
        if (kpIndex > -1) {
          // Desnormalizamos las coordenadas si es un video
          if (isVideo && !isNormalized) {
            const YOLO_RESOLUTION = 640; 
            const scaleX = naturalSize.w / YOLO_RESOLUTION;
            const scaleY = naturalSize.h / YOLO_RESOLUTION;
            person.keypoints[kpIndex].x = svgP.x / scaleX;
            person.keypoints[kpIndex].y = svgP.y / scaleY;
          } else {
            person.keypoints[kpIndex].x = svgP.x;
            person.keypoints[kpIndex].y = svgP.y;
          }
          // ¡Confirmación humana al 100%!
          person.keypoints[kpIndex].confidence = 1.0;
        }
        return newRes;
      });
      return;
    }

    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedKp(null);
  };

  const currentPerson = poseResults?.persons?.[selectedPersonIndex];
  const validKeypoints = currentPerson?.keypoints?.filter((kp: any) => {
    return !(kp.x === 0 && kp.y === 0) && (kp.confidence === undefined || kp.confidence >= 0.3);
  }) || [];

  const isVideo = poseResults?.model_used?.includes('Video');
  const isNormalized = validKeypoints.length > 0 && validKeypoints.every((p: any) => p.x <= 1.5 && p.y <= 1.5);

  const getRealCoords = (kpX: number, kpY: number) => {
    if (naturalSize.w === 0 || naturalSize.h === 0) return { x: kpX, y: kpY };

    if (isVideo) {
      if (isNormalized) {
        return { x: kpX * naturalSize.w, y: kpY * naturalSize.h };
      }
      const YOLO_RESOLUTION = 640; 
      const scaleX = naturalSize.w / YOLO_RESOLUTION;
      const scaleY = naturalSize.h / YOLO_RESOLUTION;

      return { x: kpX * scaleX, y: kpY * scaleY };
    }
    return { x: kpX, y: kpY }; 
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto font-sans h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 shrink-0">Verificación de Dataset</h1>

      {/* TOP BAR: Búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-6 shrink-0">
        <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-indigo-500" /> Cargar desde tu computadora
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carpeta del Dataset (ZIP extraído)</label>
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-600 transition-colors"
            >
              <span className="truncate">{folderName ? folderName : 'Seleccionar Carpeta...'}</span>
              <FolderOpen className="w-4 h-4 ml-2 text-indigo-500 shrink-0" />
            </button>
            <input 
              type="file" 
              // @ts-ignore
              webkitdirectory="true" 
              directory="true" 
              multiple 
              className="hidden" 
              ref={folderInputRef}
              onChange={handleFolderSelect}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Archivo a inspeccionar</label>
            <select 
              className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 text-sm ${errorFile ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={selectedFile} onChange={(e) => { setSelectedFile(e.target.value); setErrorFile(false); }} disabled={availableFiles.length === 0}
            >
              <option value="">{availableFiles.length > 0 ? 'Selecciona una imagen...' : 'Esperando archivos...'}</option>
              {availableFiles.map((f, i) => <option key={i} value={f.id}>{f.name}</option>)}
            </select>
            {errorFile && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Requerido</p>}
          </div>

          <button 
            onClick={handleLoadImage} disabled={isLoading || !selectedFile}
            className="w-full flex justify-center items-center px-4 py-2 h-[38px] bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <ImageIcon className="w-5 h-5 mr-2" />}
            {isLoading ? 'Cargando...' : 'Inspeccionar Archivo'}
          </button>
        </div>
      </div>

      {/* ÁREA DE VISUALIZACIÓN INTERACTIVA */}
      {imageUrl ? (
        <div className="flex-grow flex flex-col lg:flex-row bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden min-h-0">
          
          {/* LADO IZQUIERDO: Imagen y SVG */}
          <div 
            className="lg:w-3/5 relative bg-[#0f172a] overflow-hidden flex items-center justify-center border-r border-gray-200"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          >
            <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-slate-200/50 overflow-hidden">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"><ZoomOut className="w-5 h-5" /></button>
              <div className="px-3 py-2 border-x border-slate-200/50 text-sm font-bold text-slate-700 flex items-center justify-center bg-slate-50/50 min-w-[4rem]">{Math.round(zoom * 100)}%</div>
              <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"><ZoomIn className="w-5 h-5" /></button>
              <button onClick={handleResetView} className="p-2 hover:bg-slate-100 text-indigo-600 transition-colors border-l border-slate-200/50"><Maximize className="w-5 h-5" /></button>
            </div>

            <div 
              className="relative origin-center inline-block"
              style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                cursor: draggedKp ? 'grabbing' : (zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'),
                transitionProperty: 'transform', transitionDuration: isDragging || draggedKp ? '0ms' : '200ms', transitionTimingFunction: 'ease-out'
              }}
            >
              <img 
                src={imageUrl} alt="Dataset" 
                className="block max-w-none shadow-2xl rounded-sm pointer-events-none select-none"
                style={{ maxHeight: '65vh' }}
                onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                draggable="false"
              />

              {naturalSize.w > 0 && poseResults && validKeypoints.length > 0 && (
                <svg ref={svgRef} viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`} className="absolute inset-0 w-full h-full">
                  {/* LÍNEAS DE COLORES */}
                  {POSE_CONNECTIONS.map((connection, idx) => {
                    const kp1 = validKeypoints.find((k: any) => k.id === connection.pair[0]);
                    const kp2 = validKeypoints.find((k: any) => k.id === connection.pair[1]);
                    if (kp1 && kp2) {
                      const p1 = getRealCoords(kp1.x, kp1.y);
                      const p2 = getRealCoords(kp2.x, kp2.y);
                      return <line key={`bone-${idx}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={connection.color} strokeWidth={Math.max(naturalSize.w / 600, 1)} strokeOpacity="0.85" />;
                    }
                    return null;
                  })}
                  {/* PUNTOS REDUCIDOS DE TAMAÑO */}
                  {validKeypoints.map((kp: any) => {
                    const p = getRealCoords(kp.x, kp.y);
                    return (
                      <circle 
                        key={`joint-${kp.id}`} cx={p.x} cy={p.y} 
                        r={Math.max(naturalSize.w / 1000, 1.5)} 
                        fill={selectedKp === kp.id ? "#ef4444" : "#0ea5e9"} 
                        stroke="#ffffff" strokeWidth={Math.max(naturalSize.w / 1200, 0.5)} 
                        className="cursor-pointer hover:fill-yellow-400 transition-colors"
                        onMouseDown={(e) => { e.stopPropagation(); setDraggedKp(kp.id); setSelectedKp(kp.id); }}
                      />
                    );
                  })}
                  {/* RADAR */}
                  {selectedKp !== null && validKeypoints.filter((k: any) => k.id === selectedKp).map((kp: any) => {
                    const p = getRealCoords(kp.x, kp.y);
                    return <circle key={`radar-${kp.id}`} cx={p.x} cy={p.y} r={Math.max(naturalSize.w / 40, 15)} className="animate-ping origin-center" fill="none" stroke="#ef4444" strokeWidth={Math.max(naturalSize.w / 300, 2)} />;
                  })}
                </svg>
              )}
            </div>
          </div>
          
          {/* LADO DERECHO: Detalles */}
          <div className="lg:w-2/5 flex flex-col overflow-hidden bg-white">
            {!poseResults ? (
              <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-16 h-16 text-orange-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-700">Sin Datos de Análisis</h3>
                <p className="text-gray-500 mt-2">Esta imagen no tiene un archivo JSON de resultados o el formato no coincide.</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white border-b border-slate-100 shrink-0">
                  <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center"><Info className="w-4 h-4 mr-2" /> Datos Generales</h3>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 text-sm text-slate-600">
                    <p className="flex justify-between"><span>Modelo:</span> <strong className="text-slate-800">{poseResults.model_used || 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Sujetos:</span> <strong className="text-slate-800">{poseResults.persons_detected || 0}</strong></p>
                  </div>
                </div>

                {poseResults.persons?.length > 0 && (
                  <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 pb-0 shrink-0">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center mb-2"><User className="w-4 h-4 mr-2 text-indigo-500" /> Sujetos Detectados</h3>
                    <div className="flex overflow-x-auto gap-2 pb-2">
                      {poseResults.persons.map((_: any, index: number) => (
                        <button key={index} onClick={() => { setSelectedPersonIndex(index); setSelectedKp(null); }} className={`px-3 py-1.5 rounded-t-md font-semibold text-xs transition-all border-b-2 ${selectedPersonIndex === index ? 'bg-white text-indigo-700 border-indigo-600' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200'}`}>Persona {index + 1}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                  {validKeypoints.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {validKeypoints.map((kp: any) => {
                        const p = getRealCoords(kp.x, kp.y);
                        return (
                          <div key={kp.id} onClick={() => setSelectedKp(kp.id)} className={`p-2 rounded-lg border flex flex-col cursor-pointer transition-all ${selectedKp === kp.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 hover:bg-indigo-50 border-slate-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[12px]">{KEYPOINT_NAMES[kp.id] || `Punto ${kp.id}`}</span>
                              {kp.confidence !== undefined && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedKp === kp.id ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>{(kp.confidence * 100).toFixed(0)}%</span>}
                            </div>
                            <span className={`text-[10px] mt-1 ${selectedKp === kp.id ? 'text-indigo-200' : 'text-slate-400'}`}>Eje X: {Math.round(p.x)} | Eje Y: {Math.round(p.y)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                      <div className="text-center p-6 text-sm text-gray-400">Selecciona una persona válida para ver sus coordenadas.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center p-12">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4"><ImageIcon className="w-12 h-12 text-indigo-200" /></div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Visor de Datasets Offline</h3>
          <p className="text-sm text-gray-400 max-w-md">Selecciona la carpeta local donde extrajiste el archivo ZIP descargado. El sistema leerá el JSON y mostrará las imágenes y los puntos sin usar internet.</p>
        </div>
      )}
    </div>
  );
};
 
export default VerificarImagenes;