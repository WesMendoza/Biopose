import React from 'react';
import { Image as ImageIcon, Search, AlertCircle } from 'lucide-react';
import { useVerificarImagenes } from '../hooks/useVerificarImagenes';

const VerificarImagenes = () => {
  const {
    selectedPath, setSelectedPath,
    selectedFile, setSelectedFile,
    imageUrl,
    errorPath, setErrorPath,
    errorFile, setErrorFile,
    paths,
    availableFiles,
    handleLoadImage
  } = useVerificarImagenes();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Verificación de Imágenes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation / Selection Sidebar */}
        <div className="col-span-1 lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-indigo-500" />
              Búsqueda de Archivo
            </h4>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona la ruta a cargar
                </label>
                <select 
                  className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 text-sm ${
                    errorPath ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={selectedPath}
                  onChange={(e) => {
                    setSelectedPath(e.target.value);
                    setSelectedFile('');
                    setErrorPath(false);
                  }}
                >
                  <option value="">Elige una ruta</option>
                  {paths.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errorPath && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Debes seleccionar una ruta
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elige un archivo a cargar
                </label>
                <select 
                  className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 text-sm ${
                    errorFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setErrorFile(false);
                  }}
                  disabled={!selectedPath}
                >
                  <option value="">Elige un archivo</option>
                  {availableFiles.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {errorFile && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Debes seleccionar un archivo
                  </p>
                )}
              </div>

              <button 
                onClick={handleLoadImage}
                className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Cargar Imagen
              </button>
            </div>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="col-span-1 lg:col-span-8 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex-grow flex flex-col items-center justify-center min-h-[400px] relative">
            <div className="absolute top-4 left-6">
              <span className="text-sm font-medium text-gray-500">Previsualización</span>
            </div>
            
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Resultado de la verificación" 
                className="max-h-[500px] w-auto object-contain rounded-md shadow-sm border border-gray-200 mt-6"
              />
            ) : (
              <div className="flex flex-col items-center text-center px-4">
                <ImageIcon className="w-20 h-20 text-gray-300 mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">Selecciona primero una imagen...</h3>
                <p className="text-sm text-gray-400">Utiliza el panel lateral para elegir una ruta y un archivo a visualizar.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerificarImagenes;