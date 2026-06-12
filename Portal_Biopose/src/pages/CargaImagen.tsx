import React, { useState } from 'react';
import { CheckCircle, CloudUpload, Image as ImageIcon, Loader, Settings, X, ZoomIn, ZoomOut, Maximize, AlertCircle, User, Info } from 'lucide-react';
import { API_BASE } from '../config';
import { useCargaImagen } from '../hooks/useCargaImagen';

// 1. DICCIONARIO DE NOMBRES INTUITIVOS
const KEYPOINT_NAMES: Record<number, string> = {
  0: "Nariz", 1: "Ojo Izquierdo", 2: "Ojo Derecho", 3: "Oreja Izquierda", 4: "Oreja Derecha",
  5: "Hombro Izquierdo", 6: "Hombro Derecho", 7: "Codo Izquierdo", 8: "Codo Derecho",
  9: "Muñeca Izquierda", 10: "Muñeca Derecha", 11: "Cadera Izquierda", 12: "Cadera Derecha",
  13: "Rodilla Izquierda", 14: "Rodilla Derecha", 15: "Tobillo Izquierdo", 16: "Tobillo Derecho"
};

// 2. CONEXIONES DEL ESQUELETO (Para dibujar las líneas)
const POSE_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], // Cabeza y rostro
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Brazos y hombros
  [5, 11], [6, 12], [11, 12], // Torso
  [11, 13], [13, 15], [12, 14], [14, 16] // Piernas
];

const CargaImagen = () => {
  const {
    file, imageUrl,
    width, setWidth, height, setHeight,
    isProcessing, isPreviewModalOpen, setIsPreviewModalOpen,
    isPoseModalOpen, setIsPoseModalOpen,
    poseResults, fileInputRef,
    handleFileChange, handleProcessClick, handleGeneratePose,
    selectedPath, setSelectedPath, paths
  } = useCargaImagen();

  const [selectedKp, setSelectedKp] = useState<number | null>(null);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number>(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleCloseModal = () => {
    setIsPoseModalOpen(false);
    setSelectedKp(null);
    setSelectedPersonIndex(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- FILTRO INTELIGENTE ---
  const currentPerson = poseResults?.persons?.[selectedPersonIndex];
  const validKeypoints = currentPerson?.keypoints?.filter((kp: any) => {
    const isOriginZero = kp.x === 0 && kp.y === 0;
    const isLowConfidence = kp.confidence !== undefined && kp.confidence < 0.3;
    return !isOriginZero && !isLowConfidence;
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Carga de Imagen</h1>

      {/* --- PANELES DE CONFIGURACIÓN Y SUBIDA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-indigo-500" />
            Configuración de Extracción
          </h4>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Elije la ruta de guardado:</label>
              <select value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Selecciona una carpeta...</option>
                {paths.map((route: any) => (
                  <option key={route.id} value={route.directory}>{route.directory}</option>
                ))}
              </select>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <p className="text-sm text-indigo-800 mb-3">Tu imagen será redimensionada a: <strong>{width} X {height}</strong></p>
              <div className="space-y-3">
                <select onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); setWidth(w); setHeight(h); }} className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-md focus:ring-indigo-500" value={`${width}x${height}`}>
                  <optgroup label="Vertical"><option value="175x260">175 X 260</option><option value="225x334">225 X 334</option><option value="300x445">300 X 445</option></optgroup>
                  <optgroup label="Horizontal"><option value="250x167">250 X 167</option><option value="300x200">300 X 200</option><option value="350x233">350 X 233</option></optgroup>
                  <optgroup label="Cuadrada"><option value="250x250">250 X 250</option><option value="300x300">300 X 300</option><option value="350x350">350 X 350</option></optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" /> Cargar Archivo
          </h4>
          <hr className="mb-4 border-gray-200" />
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
              <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              {imageUrl ? (
                <div className="flex flex-col items-center">
                  <img src={imageUrl} alt="preview" className="h-32 mb-4 rounded border border-gray-300 object-cover shadow-sm" />
                  <p className="text-sm font-medium text-indigo-600">{file?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CloudUpload className="w-12 h-12 text-indigo-400 mb-3" />
                  <p className="text-gray-600 font-medium">Arrastra y suelta tu archivo aquí</p>
                </div>
              )}
            </div>
            {imageUrl && (
              <button onClick={handleProcessClick} disabled={isProcessing} className="mt-6 w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-md transition-all">
                {isProcessing ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                {isProcessing ? 'Procesando...' : 'Procesar Imagen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN PREVIA --- */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <h6 className="font-bold text-slate-800">¿Generar puntos en esta imagen?</h6>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex justify-center bg-gray-50/50">
              <img src={imageUrl!} alt="Vista previa" className="max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm" />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-white">
              <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">Cancelar</button>
              <button onClick={handleGeneratePose} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all font-medium text-sm">Generar POSE</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE RESULTADOS --- */}
      {isPoseModalOpen && poseResults && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] flex flex-col h-[95vh] overflow-hidden">
            
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
              <h5 className="text-xl font-bold text-slate-800">Análisis Biométrico</h5>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
              
              {/* === VISOR DE IMAGEN (Imagen Limpia + SVG Dinámico) === */}
              <div 
                className="lg:w-3/5 relative bg-[#0f172a] overflow-hidden flex items-center justify-center border-r border-gray-200"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
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
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transitionProperty: 'transform', transitionDuration: isDragging ? '0ms' : '200ms', transitionTimingFunction: 'ease-out'
                  }}
                >
                  <img 
                    src={imageUrl || ''}
                    alt="Imagen Original Limpia" 
                    className="block max-w-none shadow-2xl rounded-sm pointer-events-none select-none"
                    style={{ maxHeight: '85vh' }}
                    onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                    draggable="false"
                  />

                  {/* CAPA DE DIBUJO SVG (Dibuja SOLO a la persona seleccionada) */}
                  {naturalSize.w > 0 && validKeypoints.length > 0 && (
                    <svg viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`} className="absolute inset-0 w-full h-full pointer-events-none">
                      
                      {/* 1. Dibujar el Esqueleto (Huesos) */}
                      {POSE_CONNECTIONS.map(([id1, id2], idx) => {
                        const kp1 = validKeypoints.find((k: any) => k.id === id1);
                        const kp2 = validKeypoints.find((k: any) => k.id === id2);
                        if (kp1 && kp2) {
                          return (
                            <line 
                              key={`bone-${idx}`} 
                              x1={kp1.x} y1={kp1.y} 
                              x2={kp2.x} y2={kp2.y} 
                              stroke="#0ea5e9" // Color celeste para los huesos
                              strokeWidth={Math.max(naturalSize.w / 400, 2)} 
                              strokeOpacity="0.8"
                            />
                          );
                        }
                        return null;
                      })}

                      {/* 2. Dibujar las Articulaciones (Puntos) */}
                      {validKeypoints.map((kp: any) => (
                        <circle 
                          key={`joint-${kp.id}`} 
                          cx={kp.x} cy={kp.y} 
                          r={Math.max(naturalSize.w / 250, 4)} 
                          fill={selectedKp === kp.id ? "#ef4444" : "#3b82f6"} // Rojo si está seleccionado, azul si no
                          stroke="#ffffff" 
                          strokeWidth={Math.max(naturalSize.w / 600, 1.5)} 
                        />
                      ))}

                      {/* 3. Efecto Radar para la articulación seleccionada */}
                      {selectedKp !== null && validKeypoints.filter((k: any) => k.id === selectedKp).map((kp: any) => (
                        <g key={`radar-${kp.id}`}>
                          <circle cx={kp.x} cy={kp.y} r={Math.max(naturalSize.w / 40, 15)} className="animate-ping origin-center" fill="none" stroke="#ef4444" strokeWidth={Math.max(naturalSize.w / 300, 2)} />
                        </g>
                      ))}
                    </svg>
                  )}
                </div>
              </div>
              
              {/* === PANEL DERECHO === */}
              <div className="lg:w-2/5 flex flex-col bg-white overflow-hidden shrink-0">
                
                {/* 1. INFORMACIÓN GENERAL */}
                <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0">
                  <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Información General
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-600">
                    <p className="flex justify-between"><span>Modelo Utilizado:</span> <strong className="text-slate-800">{poseResults?.model_used || 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Sujetos Detectados:</span> <strong className="text-slate-800">{poseResults?.persons_detected || 0}</strong></p>
                    <p className="flex justify-between"><span>Resolución:</span> <strong className="text-slate-800">{width} x {height}</strong></p>
                  </div>
                </div>

                {/* 2. SELECTOR MULTI-PERSONA (Pestañas) */}
                {poseResults?.persons && poseResults.persons.length > 0 && (
                  <div className="bg-slate-50 border-b border-slate-200 px-6 pt-4 pb-0 shrink-0 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center">
                        <User className="w-4 h-4 mr-2 text-indigo-500" /> Sujetos Detectados ({poseResults.persons.length})
                      </h3>
                    </div>
                    <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-3">
                      {poseResults.persons.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => { setSelectedPersonIndex(index); setSelectedKp(null); }}
                          className={`flex items-center px-4 py-2 rounded-t-lg font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${
                            selectedPersonIndex === index 
                              ? 'bg-white text-indigo-700 border-indigo-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                              : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-700'
                          }`}
                        >
                          Persona {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. LISTA DE KEYPOINTS */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar bg-slate-50/30">
                  {poseResults?.persons && poseResults.persons.length > 0 ? (
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Puntos de Articulación (Persona {selectedPersonIndex + 1})
                        </h3>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          Haz click para ubicar
                        </span>
                      </div>
                      
                      {validKeypoints.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                          {validKeypoints.map((kp: any) => (
                            <div 
                              key={kp.id}
                              onClick={() => setSelectedKp(kp.id)}
                              className={`p-3 rounded-xl border flex flex-col justify-center cursor-pointer transition-all duration-200 ${
                                selectedKp === kp.id 
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg transform scale-[1.02]' 
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-bold text-[13px]">{KEYPOINT_NAMES[kp.id] || `Punto ${kp.id}`}</span>
                                {kp.confidence && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    selectedKp === kp.id ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {(kp.confidence * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <span className={`text-[11px] font-medium ${selectedKp === kp.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                Eje X: {Math.round(kp.x)} | Eje Y: {Math.round(kp.y)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-sm text-orange-700 flex items-start shadow-sm">
                          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                          <p>Esta persona está parcialmente oculta y la Inteligencia Artificial no logró detectar sus articulaciones con suficiente seguridad.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-700 flex items-start shadow-sm">
                      <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                      <p>El modelo no encontró siluetas humanas claras en la imagen.</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-200 shrink-0">
                    <button className="flex-1 py-3 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl font-bold transition-colors text-sm shadow-sm" onClick={handleCloseModal}>
                      Descartar Análisis
                    </button>
                    <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-lg text-sm" onClick={handleCloseModal}>
                      Guardar Resultados
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

export default CargaImagen;