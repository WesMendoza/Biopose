import { useState, useRef } from 'react';
import api from '../lib/api';

export const useGenerarImagenes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(1);
  
  // <-- ESTOS ERAN LOS ESTADOS QUE FALTABAN
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
    // Claves exactas que espera tu GenerateFramesRequestSerializer en Django
    fd.append('video', file);
    fd.append('fps_value', String(fps));
    fd.append('max_duration_seconds', '0'); // 0 = Procesar todo el video

    try {
      const res = await api.postForm('/api/analysis/frames/generate-from-video/', fd);
      
      const data = res?.detalle || res;
      
      if (data?.frames) {
        setGeneratedFrames(data.frames);
        setResultsData({
          total_frames: data.total_frames_generated,
          duration: data.duration_seconds,
          message: data.message
        });
      }
      
      setIsModalOpen(true);
    } catch (error: any) {
      alert(error?.response?.mensaje || 'Error al generar los fotogramas');
    } finally {
      setIsProcessing(false);
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
    width, setWidth,             // <-- Agregados al return
    height, setHeight,           // <-- Agregados al return
    isModalOpen, setIsModalOpen, // <-- Agregado setIsModalOpen
    generatedFrames,
    resultsData,
    fileInputRef,
    handleFileChange,
    handleGenerateImages,
    closeModals,
    handleReuploadClick
  };
};