import { useRef, useState, useEffect } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export const useCargaImagen = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(445);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPoseModalOpen, setIsPoseModalOpen] = useState(false);
  const [poseResults, setPoseResults] = useState<any>(null);
  const [imageId, setImageId] = useState<number | null>(null);
  
  // === ESTADO PARA EL "CARRITO" DE LOTES ===
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cargarRutas = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decoded: any = jwtDecode(token);
        const idEmpresa = decoded.idEmpresa;
        await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
      } catch (error) {
        console.error("Error al cargar rutas:", error);
      }
    };
    cargarRutas();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
      setPoseResults(null);
      setImageId(null);
    }
  };

  const handleProcessClick = () => {
    if (!file) return;
    setIsPreviewModalOpen(true);
  };

  const handleGeneratePose = async () => {
    if (!file) return;
    setIsPreviewModalOpen(false);
    setIsProcessing(true);

    const fd = new FormData();
    fd.append('image', file);

    try {
      const resUpload = await api.postForm('/api/analysis/media/images/upload/', fd);
      const uploadedImageId = resUpload?.idImageUpload || resUpload?.detalle?.idImageUpload;
      
      if (!uploadedImageId) throw new Error('No se recibió ID de imagen subida');
      setImageId(uploadedImageId);

      const resProcess = await api.post(`/api/analysis/pose/image/${uploadedImageId}/process/`, {});
      setPoseResults(resProcess);
      setIsPoseModalOpen(true);
    } catch (error: any) {
      alert(error?.response?.mensaje || 'Error al procesar la imagen');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // === AÑADIR AL CONJUNTO ===
  const handleAddToBatch = () => {
    if (!imageId || !poseResults) return;

    setBatchResults(prev => [...prev, {
      imageId: imageId,
      results: poseResults,
      originalName: file?.name || `Imagen_${imageId}`,
      previewUrl: imageUrl 
    }]);

    setIsPoseModalOpen(false);
    setFile(null);
    setImageUrl(null);
    setPoseResults(null);
    setImageId(null);
  };

  // === DESCARGAR TODO EL LOTE ===
  const handleDownloadBatch = async () => {
    if (batchResults.length === 0) {
      alert("No hay imágenes en el conjunto para descargar.");
      return;
    }

    try {
      const blob = await api.postBlob(`/api/analysis/pose/batch/save-to-disk/`, {
        batch: batchResults
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dataset_Lote_${batchResults.length}_Imagenes.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setBatchResults([]); 
      
    } catch (error: any) {
      console.error("Error al exportar lote a disco:", error);
      alert("Error al intentar descargar el archivo ZIP del lote.");
    }
  };

  // === ELIMINAR UNA IMAGEN DEL CONJUNTO ===
  const handleRemoveFromBatch = async (indexToRemove: number) => {
    const itemToRemove = batchResults[indexToRemove];
    
    // Eliminación lógica del carrito
    setBatchResults(prev => prev.filter((_, index) => index !== indexToRemove));
    
    // Opcional: Intentar borrar la imagen del servidor si la quitan del carrito
    try {
        await api.del(`/api/analysis/media/images/${itemToRemove.imageId}/`);
    } catch(e) {
        console.warn("No se pudo limpiar la imagen descartada del servidor.");
    }
  };

  const handleSaveResults = async () => {
    if (!imageId || !poseResults) {
      alert("Faltan datos de configuración o análisis previo para guardar.");
      return;
    }

    try {
      const blob = await api.postBlob(`/api/analysis/pose/image/${imageId}/save-to-disk/`, {
        results: poseResults
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dataset_Imagen_${imageId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsPoseModalOpen(false); 
    } catch (error: any) {
      console.error("Error al exportar a disco:", error);
      alert("Error al intentar descargar el archivo ZIP.");
    }
  };

  return {
    file, imageUrl, width, setWidth, height, setHeight,
    isProcessing, isPreviewModalOpen, setIsPreviewModalOpen,
    isPoseModalOpen, setIsPoseModalOpen,
    poseResults, setPoseResults, 
    imageId, batchResults, 
    fileInputRef, handleFileChange, handleProcessClick,
    handleGeneratePose, handleSaveResults,
    handleAddToBatch, handleDownloadBatch, handleRemoveFromBatch
  };
};