import { useRef, useState } from 'react';
import api from '../lib/api';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // PASO 1: Subir imagen
      const resUpload = await api.postForm('/api/analysis/media/images/upload/', fd);
      const uploadedImageId = resUpload?.idImageUpload || resUpload?.detalle?.idImageUpload;
      
      if (!uploadedImageId) throw new Error('No se recibió ID de imagen subida');
      setImageId(uploadedImageId);

      // PASO 2: Procesar con YOLO para detectar pose
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

  return {
    file,
    imageUrl,
    width,
    setWidth,
    height,
    setHeight,
    isProcessing,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isPoseModalOpen,
    setIsPoseModalOpen,
    poseResults,
    imageId,
    fileInputRef,
    handleFileChange,
    handleProcessClick,
    handleGeneratePose
  };
};
