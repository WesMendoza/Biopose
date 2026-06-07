import { useState, useRef } from 'react';
import api from '../lib/api';

export const useGenerarImagenes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(1);
  
  const [width, setWidth] = useState(250);
  const [height, setHeight] = useState(250);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [generatedFrames, setGeneratedFrames] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setGeneratedFrames([]);
      setResultsData(null);
    }
  };

  const handleGenerateImages = async () => {
    if (!file) return;
    setIsProcessing(true);

    const fd = new FormData();
    fd.append('video', file);

    try {
      // PASO 1: Subir el video usando el endpoint de Media
      const resUpload = await api.postForm('/api/analysis/media/videos/upload/', fd);
      const videoId = resUpload?.idVideoUpload || resUpload?.id || resUpload?.video_id;

      if (!videoId) {
        throw new Error('No se recibió el ID del video subido.');
      }

      // PASO 2: Mandar a procesar usando el endpoint de Behavior
      await api.post(`/api/analysis/videos/${videoId}/process/`, {
        mode: 'operativo',
        dimension: '2D',
        fps_skip: fps, // Enviamos tu estado de fps como parámetro fps_skip
        confidence_threshold: 0.75
      });

      // PASO 3: Consultar el estado cíclicamente (Polling)
      const intervalId = window.setInterval(async () => {
        try {
          const resStatus = await api.get(`/api/analysis/videos/${videoId}/results/`);

          if (resStatus?.status === 'completed') {
            window.clearInterval(intervalId);
            setIsProcessing(false);

            // Mapeamos los datos que SÍ devuelve tu backend actualmente
            setResultsData({
              total_frames: resStatus.total_frames,
              duration: resStatus.duration_seconds,
              message: "Análisis completado con éxito"
            });

            // Si en el futuro tu backend devuelve un array de URLs de imágenes,
            // se setearían aquí: setGeneratedFrames(resStatus.frames || []);

            setIsModalOpen(true);
          } else if (resStatus?.status === 'failed') {
            window.clearInterval(intervalId);
            setIsProcessing(false);
            alert(resStatus?.message || 'Error crítico en el procesamiento del video.');
          }
        } catch (error) {
          console.error('Error consultando estado:', error);
          window.clearInterval(intervalId);
          setIsProcessing(false);
          alert('Se perdió la conexión al consultar el estado del procesamiento.');
        }
      }, 3000); // Consulta cada 3 segundos

    } catch (error: any) {
      setIsProcessing(false);
      alert(error?.response?.mensaje || error?.message || 'Error al comunicarse con el servidor');
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };

  const handleReuploadClick = () => {
    setFile(null);
    setVideoUrl(null);
    setGeneratedFrames([]);
    setResultsData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    file,
    videoUrl,
    isProcessing,
    fps, setFps,
    width, setWidth,
    height, setHeight,
    isModalOpen, setIsModalOpen,
    generatedFrames,
    resultsData,
    fileInputRef,
    handleFileChange,
    handleGenerateImages,
    closeModals,
    handleReuploadClick
  };
};