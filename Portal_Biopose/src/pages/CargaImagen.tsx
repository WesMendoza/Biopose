import React, { useState, useRef } from 'react';
import { CheckCircle, CloudUpload, Image as ImageIcon, Loader, Settings, X, ZoomIn, ZoomOut, Maximize, AlertCircle, User, Info, Download, Trash2, PlusCircle } from 'lucide-react';
import { useCargaImagen } from '../hooks/useCargaImagen';
import { KEYPOINT_NAMES } from '../utils/ai-visuals';
import { SkeletonSvgOverlay } from '../components/SkeletonSvgOverlay';
import uploadGif from '../assets/upload.gif';
import bannerImg from '../assets/banner.png';

const CargaImagen = () => {
  const {
    file, imageUrl, width, setWidth, height, setHeight,
    isProcessing, isPreviewModalOpen, setIsPreviewModalOpen,
    isPoseModalOpen, setIsPoseModalOpen,
    poseResults, setPoseResults, fileInputRef, batchResults,
    handleFileChange, handleProcessClick, handleGeneratePose,
    handleAddToBatch, handleDownloadBatch, handleRemoveFromBatch
  } = useCargaImagen();

  const [selectedKp, setSelectedKp] = useState<number | null>(null);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number>(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedKp, setDraggedKp] = useState<number | null>(null);
  
  const handleCloseModal = () => {
    setIsPoseModalOpen(false); setSelectedKp(null); setSelectedPersonIndex(0);
    setZoom(1); setPan({ x: 0, y: 0 }); setDraggedKp(null);
  };

  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
          person.keypoints[kpIndex].x = svgP.x;
          person.keypoints[kpIndex].y = svgP.y;
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

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col lg:flex-row gap-8 lg:min-h-[calc(100vh-8rem)]">
        
        {/* COLUMNA IZQUIERDA (Título + Banner) */}
        <div className="lg:w-1/3 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Extracción de Keypoints</h1>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative shrink-0 group min-h-[300px] flex-grow">
            <img src={bannerImg} alt="Banner Image" className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent flex flex-col justify-end p-8">
               <h2 className="text-2xl xl:text-3xl font-bold text-white mb-3">Procesamiento de Imágenes</h2>
               <p className="text-indigo-100 text-sm leading-relaxed">
                 Sube una imagen para que la Inteligencia Artificial extraiga el esqueleto corporal y lo convierta a los formatos normalizados. Configura la dimensión final y previsualiza los puntos clave en tiempo real.
               </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL (COLUMNAS DERECHAS) */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="hidden lg:block h-[56px] shrink-0" aria-hidden="true"></div>
          
          <div className="flex-grow flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- COLUMNA 1: CONFIGURACIÓN Y LOTE --- */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-indigo-500" /> Configuración de Extracción
          </h4>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <p className="text-sm text-indigo-800 mb-3">Tu imagen será redimensionada a: <strong>{width} X {height}</strong></p>
              <select onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); setWidth(w); setHeight(h); }} className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-md focus:ring-indigo-500" value={`${width}x${height}`}>
                <optgroup label="Vertical"><option value="175x260">175 X 260</option><option value="225x334">225 X 334</option><option value="300x445">300 X 445</option></optgroup>
                <optgroup label="Horizontal"><option value="250x167">250 X 167</option><option value="300x200">300 X 200</option><option value="350x233">350 X 233</option></optgroup>
                <optgroup label="Cuadrada"><option value="250x250">250 X 250</option><option value="300x300">300 X 300</option><option value="350x350">350 X 350</option></optgroup>
              </select>
            </div>
          </div>

          {/* === ZONA DEL CARRITO / LOTE === */}
          {batchResults.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center justify-between">
                Lote de Procesamiento 
                <span className="bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full font-bold">{batchResults.length} ítems</span>
              </h4>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {batchResults.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    <div className="flex items-center">
                      <img src={item.previewUrl} className="w-10 h-10 object-cover rounded bg-white border border-gray-200 mr-3" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{(index + 1).toString().padStart(4, '0')}</span>
                        <span className="text-[10px] text-gray-500 truncate w-32" title={item.originalName}>{item.originalName}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromBatch(index)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Eliminar del lote">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleDownloadBatch} 
                className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-bold shadow-md transition-all"
              >
                <Download className="w-5 h-5 mr-2" /> 
                Descargar Dataset ZIP ({batchResults.length})
              </button>
            </div>
          )}
        </div>

        {/* --- COLUMNA 2: CARGA DE ARCHIVO --- */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4"><ImageIcon className="w-5 h-5 mr-2 text-indigo-500" /> Cargar Archivo</h4>
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
                  <img src={uploadGif} alt="Upload" className="w-20 h-20 mb-3 opacity-80 mix-blend-multiply" />
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
      </div>
      </div>
      </div>

      {/* --- MODALES --- */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <h6 className="font-bold text-slate-800">¿Generar puntos en esta imagen?</h6>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex justify-center bg-gray-50/50"><img src={imageUrl!} alt="Vista previa" className="max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm" /></div>
            <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-white">
              <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">Cancelar</button>
              <button onClick={handleGeneratePose} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all font-medium text-sm">Generar POSE</button>
            </div>
          </div>
        </div>
      )}

      {isPoseModalOpen && poseResults && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] flex flex-col h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
              <h5 className="text-xl font-bold text-slate-800 flex items-center">Análisis Biométrico <span className="ml-4 text-xs font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded">Puedes arrastrar los puntos para corregirlos</span></h5>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
              
              {/* === VISOR INTERACTIVO === */}
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
                    cursor: draggedKp ? 'grabbing' : (zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'),
                    transitionProperty: 'transform', transitionDuration: isDragging || draggedKp ? '0ms' : '200ms', transitionTimingFunction: 'ease-out'
                  }}
                >
                  <img
                    src={imageUrl || ''} alt="Original Limpia"
                    className="block max-w-none shadow-2xl rounded-sm pointer-events-none select-none"
                    style={{ maxHeight: '85vh' }}
                    onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} draggable="false"
                  />

                  {naturalSize.w > 0 && validKeypoints.length > 0 && (
                    <SkeletonSvgOverlay 
                      ref={svgRef}
                      keypoints={validKeypoints}
                      naturalSize={naturalSize}
                      selectedKp={selectedKp}
                      onKpMouseDown={(id) => {
                        setDraggedKp(id);
                        setSelectedKp(id);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* === PANEL DERECHO DE INFORMACIÓN === */}
              <div className="lg:w-2/5 flex flex-col bg-white overflow-hidden shrink-0">
                <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0">
                  <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center"><Info className="w-4 h-4 mr-2" /> Información General</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-600">
                    <p className="flex justify-between"><span>Modelo Utilizado:</span> <strong className="text-slate-800">{poseResults?.model_used || 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Sujetos Detectados:</span> <strong className="text-slate-800">{poseResults?.persons_detected || 0}</strong></p>
                    <p className="flex justify-between"><span>Resolución:</span> <strong className="text-slate-800">{width} x {height}</strong></p>
                  </div>
                  
                  {/* === NUEVO: MENSAJE INFORMATIVO === */}
                  <div className="mt-3 p-3 bg-blue-50/80 border border-blue-100 rounded-lg flex items-start shadow-sm">
                    <Info className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Nota:</strong> El valor de la confianza es generado en el análisis inicial de la IA y no cambia aunque se modifiquen las coordenadas manualmente.
                    </p>
                  </div>
                </div>

                {poseResults?.persons && poseResults.persons.length > 0 && (
                  <div className="bg-slate-50 border-b border-slate-200 px-6 pt-4 pb-0 shrink-0 shadow-inner">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center mb-3"><User className="w-4 h-4 mr-2 text-indigo-500" /> Sujetos Detectados</h3>
                    <div className="flex overflow-x-auto gap-2 pb-3">
                      {poseResults.persons.map((_: any, index: number) => (
                        <button key={index} onClick={() => { setSelectedPersonIndex(index); setSelectedKp(null); }} className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-b-2 ${selectedPersonIndex === index ? 'bg-white text-indigo-700 border-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200'}`}>Persona {index + 1}</button>
                      ))}
                    </div>
                  </div>
                )}

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
                              {kp.confidence && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedKp === kp.id ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>{(kp.confidence * 100).toFixed(0)}%</span>}
                            </div>
                            <span className={`text-[11px] font-medium ${selectedKp === kp.id ? 'text-indigo-200' : 'text-slate-400'}`}>X: {Math.round(kp.x)} | Y: {Math.round(kp.y)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (<div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-700 flex items-start shadow-sm"><AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" /><p>No hay articulaciones visibles para esta persona.</p></div>)}
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-200 shrink-0">
                    <button className="flex-1 py-3 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl font-bold transition-colors text-sm shadow-sm" onClick={handleCloseModal}>
                      Descartar Análisis
                    </button>
                    <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md shadow-green-200 hover:shadow-lg text-sm flex justify-center items-center" onClick={handleAddToBatch}>
                      <PlusCircle className="w-5 h-5 mr-2" /> Añadir al Conjunto
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