import { useState, useRef } from 'react';
import api from '../lib/api';
import { API_BASE } from '../config'; // Importamos la URL base para armar las rutas de streaming/descarga

export const useVideoDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // URL local del video original
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Parámetros para enviar al backend
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NUEVOS ESTADOS: Para los resultados del backend
  const [processedStreamUrl, setProcessedStreamUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      // Limpiamos estados anteriores si sube un nuevo video
      setProcessedStreamUrl(null);
      setDownloadUrl(null);
      setAnalysisResults(null);
    }
  };

  const handleProcessVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10); // Iniciamos el progreso (Subiendo...)

    const fd = new FormData();
    fd.append('video', file); // Asegúrate de que el backend espera 'video' (o cámbialo a 'file' si es necesario)

    try {
      // 1. SUBIDA DEL VIDEO
      const resUpload = await api.postForm('/api/analysis/videos/upload/', fd);
      const videoId = resUpload?.detalle?.id || resUpload?.id || resUpload?.video_id;
      
      if (!videoId) throw new Error("No se recibió el ID del video subido.");
      setProgress(30); // Subida completa

      // 2. INICIAR EL PROCESAMIENTO (YOLOv8)
      await api.post(`/api/analysis/videos/${videoId}/process/`, { 
        fps_skip: framesSkip, 
        dimension: poseMode 
      });
      setProgress(40); // Procesamiento iniciado

      // 3. POLLING: Consultar resultados cada 3 segundos
      const interval = setInterval(async () => {
        try {
          const resStatus = await api.get(`/api/analysis/videos/${videoId}/results/`);
          
          // Revisa la palabra exacta que devuelve tu backend (ej: 'COMPLETADO', 'PROCESADO', 'FINISHED')
          const estadoBackend = resStatus?.estado || resStatus?.status || resStatus?.detalle?.estado;

          if (estadoBackend === 'COMPLETADO' || estadoBackend === 'PROCESADO' || resStatus?.resultados) {
            clearInterval(interval);
            setProgress(100);
            setIsProcessing(false);
            
            // Guardamos los resultados (JSON con métricas)
            setAnalysisResults(resStatus?.resultados || resStatus?.detalle);
            
            // Armamos las URLs para Streaming y Descarga
            // OJO: Si estos endpoints requieren token, deberás agregarlo.
            setProcessedStreamUrl(`${API_BASE}/api/analysis/videos/${videoId}/stream/`);
            setDownloadUrl(`${API_BASE}/api/analysis/videos/${videoId}/download/`);
            
          } else {
            // Si el backend aún no termina, hacemos que la barra avance lentamente hasta el 90%
            setProgress((prev) => (prev < 90 ? prev + 5 : 90));
          }
        } catch (error) {
          console.error("Error consultando estado:", error);
          clearInterval(interval);
          setIsProcessing(false);
          alert("Se perdió la conexión al consultar el estado del procesamiento.");
        }
      }, 3000); // Consulta cada 3000 milisegundos (3 segundos)

    } catch (error: any) {
      setIsProcessing(false);
      setProgress(0);
      alert(error?.response?.mensaje || 'Error al enviar el video al servidor');
    }
  };

  const handleReuploadClick = () => {
    setFile(null);
    setVideoUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setProcessedStreamUrl(null);
    setDownloadUrl(null);
    setAnalysisResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    file,
    videoUrl,
    isProcessing,
    progress,
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    processedStreamUrl,  // <-- Exportamos la URL del streaming
    downloadUrl,         // <-- Exportamos la URL de descarga
    analysisResults,     // <-- Exportamos los resultados
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick
  };
};