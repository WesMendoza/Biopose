import React, { useState, useRef } from 'react';
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle, CloudUpload, Loader, Image as ImageIcon, X } from 'lucide-react';

const CargaImagen = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(445);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPoseModalOpen, setIsPoseModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
    }
  };

  const handleProcessClick = () => {
    if (!file) return;
    setIsPreviewModalOpen(true);
  };

  const handleGeneratePose = () => {
    setIsPreviewModalOpen(false);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPoseModalOpen(true);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Carga de Imagen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-indigo-500" />
            Configuración de Extracción
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Elije la ruta de guardado:</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Selecciona una carpeta...</option>
                <option value="1">/imagenes/test1</option>
                <option value="2">/imagenes/training</option>
              </select>
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
                  value={`${width}x${height}`}
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
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Cargar Archivo
          </h4>
          <hr className="mb-4 border-gray-200" />
          
          <div className="flex-grow flex flex-col justify-center items-center">
            <div 
              className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {imageUrl ? (
                <div className="flex flex-col items-center">
                  <img src={imageUrl} alt="preview" className="h-32 mb-4 rounded border border-gray-300 object-cover" />
                  <p className="text-sm font-medium text-indigo-600">{file?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CloudUpload className="w-12 h-12 text-indigo-400 mb-3" />
                  <p className="text-gray-600 font-medium">Arrastra y suelta tu archivo aquí</p>
                  <p className="text-gray-400 text-sm mt-1">o haz clic para elegirlo</p>
                </div>
              )}
            </div>

            {imageUrl && (
              <button
                onClick={handleProcessClick}
                disabled={isProcessing}
                className="mt-6 w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                {isProcessing ? (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Procesar Imagen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Confirmation Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center rounded-t-lg">
              <h6 className="font-bold text-gray-700">¿Deseas generar los puntos en esta imagen?</h6>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center bg-gray-100">
              <img src={imageUrl!} alt="Vista previa" className="max-h-64 object-contain rounded border border-gray-200" />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGeneratePose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Generar POSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pose Generated Modal */}
      {isPoseModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg bg-gray-50">
              <h5 className="text-xl font-bold text-gray-800">Imagen Procesada</h5>
              <button onClick={() => setIsPoseModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2 flex items-center justify-center bg-gray-100 rounded-md min-h-[300px] border border-gray-200 relative">
                <img src={imageUrl!} alt="Resultado" className="opacity-50 max-h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-indigo-600 font-bold bg-white/80 px-4 py-2 rounded">Puntos generados (Simulado)</p>
                </div>
              </div>
              
              <div className="lg:w-1/2 flex flex-col">
                <div className="mb-4 text-center">
                  <h2 className="text-sm text-gray-500 font-semibold mb-1">Dimensión de la imagen actual</h2>
                  <p className="text-lg text-indigo-700 font-bold">{width} x {height}</p>
                </div>
                
                <h3 className="font-semibold text-gray-700 mb-4">Puntos generados:</h3>
                
                <div className="grid grid-cols-3 gap-2 flex-grow mb-6">
                  {/* Point Layout matching the original modal logic */}
                  <div className="flex flex-col gap-2">
                    {[2, 4, 6, 8, 10, 12].map(num => (
                      <div key={num} className="bg-blue-50 text-blue-700 text-center py-2 rounded font-medium text-sm border border-blue-100">Punto {num}</div>
                    ))}
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    {[1, 14].map(num => (
                      <div key={num} className="bg-indigo-50 text-indigo-700 text-center py-2 rounded font-medium text-sm border border-indigo-100">Punto {num}</div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[3, 5, 7, 9, 11, 13].map(num => (
                      <div key={num} className="bg-green-50 text-green-700 text-center py-2 rounded font-medium text-sm border border-green-100">Punto {num}</div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button className="flex-1 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium transition-colors"
                  onClick={() => setIsPoseModalOpen(false)}>
                    Descartar
                  </button>
                  <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
                  onClick={() => setIsPoseModalOpen(false)}>
                    Guardar Imagen
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

export default CargaImagen;