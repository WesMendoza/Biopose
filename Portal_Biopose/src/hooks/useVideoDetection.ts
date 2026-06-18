import { useRef, useState, useEffect } from 'react';
import { API_BASE } from '../config';
import api from '../lib/api';

export const useVideoDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [mode, setMode] = useState<'operativo' | 'analitico' | 'debug'>('operativo');
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [jsonKeypointsUrl, setJsonKeypointsUrl] = useState<string | null>(null);
  const [keypointsData, setKeypointsData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processedStreamUrl, setProcessedStreamUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // === NUEVO: Referencia secreta para recordar el ID del video si cambiamos de pantalla ===
  const currentVideoIdRef = useRef<string | number | null>(null);

  // === NUEVO: El "Testamento" de React ===
  // Esto solo se ejecuta cuando el usuario ABANDONA la pantalla
  useEffect(() => {
    return () => {
      // Si el componente muere y quedó un video registrado, lo mandamos a borrar
      if (currentVideoIdRef.current) {
        // Al cambiar de pantalla usamos un borrado silencioso (.catch vacío)
        api.del(`/api/analysis/media/videos/${currentVideoIdRef.current}/`)
           .catch(() => console.log("Limpieza silenciosa al cambiar de pantalla."));
      }
    };
  }, []);

  const resolveUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const loadKeypointsJson = async (videoId: number | string) => {
    try {
      const response = await api.get(`/api/analysis/videos/${videoId}/keypoints-json/`);
      
      if (response && response.keypoints) {
        setKeypointsData(response.keypoints);
        setJsonKeypointsUrl(`/api/analysis/videos/${videoId}/keypoints-json/`);
      } else {
        throw new Error('La respuesta de la API no contiene los keypoints.');
      }
    } catch (error) {
      console.warn('Error cargando JSON de keypoints a través de la API:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setIsProcessing(false);
      setProgress(0);
      setAnalysisResults(null);
      setAnalysisReport(null);
      setJsonKeypointsUrl(null);
      setKeypointsData(null);
      setErrorMessage(null);
      setDownloadUrl(null);
      setProcessedStreamUrl(null);
    }
  };

  const handleProcessVideo = async () => {
    if (!file) return;
    setErrorMessage(null);
    setIsProcessing(true);
    setProgress(10);

    const fd = new FormData();
    fd.append('video', file);

    try {
      const resUpload = await api.postForm('/api/analysis/media/videos/upload/', fd);
      const createdVideoId = resUpload?.idVideoUpload || resUpload?.id || resUpload?.video_id;

      if (!createdVideoId) {
        throw new Error('No se recibió el ID del video subido.');
      }

      // === NUEVO: Guardamos el ID en la referencia secreta ===
      currentVideoIdRef.current = createdVideoId;

      setProgress(30);

      await api.post(`/api/analysis/videos/${createdVideoId}/process/`, {
        mode,
        dimension: poseMode,
        fps_skip: framesSkip,
        confidence_threshold: confidenceThreshold,
      });

      setProgress(45);

      const intervalId = window.setInterval(async () => {
        try {
          const resStatus = await api.get(`/api/analysis/videos/${createdVideoId}/results/`);

          if (resStatus?.status === 'completed') {
            window.clearInterval(intervalId);
            setProgress(100);
            setIsProcessing(false);
            setAnalysisResults(resStatus);
            setAnalysisReport(resStatus.analysis_report || null);

            const streamUrl = resStatus.stream_url || resStatus.video_url || resStatus.download_url || resStatus.rutaVideoProcesado || resStatus.rutaArchivoProcesado || null;
            if (streamUrl) {
              setDownloadUrl(resolveUrl(streamUrl));
            }

            await loadKeypointsJson(createdVideoId);
            
          } else if (resStatus?.status === 'processing') {
            setProgress((prev) => (prev < 90 ? prev + 5 : 90));
          } else if (resStatus?.status === 'failed') {
            window.clearInterval(intervalId);
            setErrorMessage(resStatus?.message || 'El procesamiento falló.');
            setIsProcessing(false);
          } else {
            setProgress((prev) => (prev < 80 ? prev + 3 : prev));
          }
        } catch (error: any) {
          console.error('Error consultando estado:', error);
          window.clearInterval(intervalId);
          setIsProcessing(false);
          setErrorMessage('Se perdió la conexión al consultar el estado del procesamiento.');
        }
      }, 3000);
    } catch (error: any) {
      setIsProcessing(false);
      setProgress(0);
      const message = error?.response?.mensaje || error?.message || 'Error al enviar el video al servidor';
      setErrorMessage(message);
    }
  };

  const handleReuploadClick = async () => {
    // === NUEVO: Limpiamos el servidor si hacemos clic en Procesar Nuevo Video ===
    if (currentVideoIdRef.current) {
      try {
        await api.del(`/api/analysis/media/videos/${currentVideoIdRef.current}/`);
      } catch (error) {
        console.warn("No se pudo eliminar el archivo temporal del servidor", error);
      }
      // Vaciamos la referencia para que el testamento (Unmount) no lo intente borrar de nuevo
      currentVideoIdRef.current = null;
    }

    setFile(null);
    setVideoUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setAnalysisResults(null);
    setAnalysisReport(null);
    setJsonKeypointsUrl(null);
    setKeypointsData(null);
    setErrorMessage(null);
    setDownloadUrl(null);
    setProcessedStreamUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    file,
    videoUrl,
    isProcessing,
    progress,
    mode,
    setMode,
    framesSkip,
    setFramesSkip,
    poseMode,
    setPoseMode,
    confidenceThreshold,
    setConfidenceThreshold,
    processedStreamUrl,
    downloadUrl,
    analysisResults,
    analysisReport,
    jsonKeypointsUrl,
    keypointsData,
    errorMessage,
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick
  };
};