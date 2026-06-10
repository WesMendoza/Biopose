import { useRef, useState } from 'react';
import api from '../lib/api';

export const useGenerarImagenes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(5);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(300);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // NUEVO: Guardamos el JSON con los puntos y los datos
  const [keypointsData, setKeypointsData] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setIsProcessing(false);
      setKeypointsData([]);
      setResultsData(null);
      setErrorMessage(null);
    }
  };

  const handleReuploadClick = () => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    setFile(null);
    setVideoUrl(null);
    setIsProcessing(false);
    setIsModalOpen(false);
    setKeypointsData([]);
    setResultsData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateImages = async () => {
    if (!file) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const fd = new FormData();
    fd.append('video', file);

    try {
      const resUpload = await api.postForm('/api/analysis/media/videos/upload/', fd);
      const createdVideoId = resUpload?.idVideoUpload || resUpload?.id || resUpload?.video_id;

      if (!createdVideoId) throw new Error('No se recibió el ID del video subido.');

      // Mandamos a analizar el comportamiento
      await api.post(`/api/analysis/videos/${createdVideoId}/process/`, { fps_skip: fps });

      const pollResults = async () => {
        try {
          const resStatus = await api.get(`/api/analysis/videos/${createdVideoId}/results/`);
          const currentStatus = (resStatus?.status || '').toLowerCase();

          if (currentStatus === 'completed') {
            setIsProcessing(false);
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

            setResultsData(resStatus.analysis_report || resStatus);

            // ¡CRÍTICO! Pedimos el JSON con las coordenadas para dárselas a React
            try {
              const keypointsRes = await api.get(`/api/analysis/videos/${createdVideoId}/keypoints-json/`);
              const framesData = keypointsRes.keypoints_data || keypointsRes.keypoints || keypointsRes.frames || keypointsRes.data || (Array.isArray(keypointsRes) ? keypointsRes : []);
              
              setKeypointsData(framesData);
              
              if (framesData.length > 0) {
                setIsModalOpen(true);
              } else {
                setErrorMessage("No se detectaron poses en este video.");
              }
            } catch (err) {
              setErrorMessage("Se completó el análisis pero falló la descarga de coordenadas.");
            }

          } else if (currentStatus === 'failed') {
            setIsProcessing(false);
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            setErrorMessage(resStatus?.message || 'Falló en el servidor.');
          } else {
            pollTimeoutRef.current = setTimeout(pollResults, 5000);
          }
        } catch (error: any) {
          setIsProcessing(false);
          if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
          setErrorMessage('Se perdió la conexión.');
        }
      };

      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = setTimeout(pollResults, 5000);

    } catch (error: any) {
      setIsProcessing(false);
      setErrorMessage(error?.message || 'Error al comunicarse con el servidor');
    }
  };

  return {
    file, videoUrl, fps, setFps, width, setWidth, height, setHeight,
    isProcessing, isModalOpen, setIsModalOpen,
    keypointsData, resultsData, errorMessage,
    fileInputRef, handleFileChange, handleGenerateImages, handleReuploadClick
  };
};