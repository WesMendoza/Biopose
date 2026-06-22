import { useRef, useState, useEffect } from 'react';
import { API_BASE } from '../config';
import api from '../lib/api';

export const useVideoActionMultiPerson = () => {
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
  const [detailedDetections, setDetailedDetections] = useState<any[]>([]); 
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processedStreamUrl, setProcessedStreamUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentVideoIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    return () => {
      if (currentVideoIdRef.current) {
        api.del(`/api/analysis/media/videos/${currentVideoIdRef.current}/`)
           .catch(() => {}); 
      }
    };
  }, []);

  const resolveUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const loadKeypointsJson = async (rutaJson: string) => {
    try {
      const timestamp = new Date().getTime();
      const cleanPath = rutaJson.replace(/^\//, '');
      const fileUrl = resolveUrl(`media/${cleanPath}?t=${timestamp}`);
      
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`El archivo físico no se encontró`);
      
      const rawData = await response.json();

      let kps = [];
      let dets = [];

      if (Array.isArray(rawData)) {
          kps = rawData; 
      } else if (rawData && typeof rawData === 'object') {
          kps = rawData.keypoints || [];
          dets = rawData.detections || [];
      }
      
      setKeypointsData(kps);
      setDetailedDetections(dets); 
      setJsonKeypointsUrl(fileUrl);
    } catch (error: any) {
      console.warn('Error descargando JSON:', error);
      setErrorMessage(`No se pudo leer el JSON: ${error.message}`);
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
      setDetailedDetections([]);
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

      if (!createdVideoId) throw new Error('No se recibió el ID del video.');

      currentVideoIdRef.current = createdVideoId;
      setProgress(30);

      // =================================================================
      // RASTREADOR 1: Petición enviada
      // =================================================================
      console.log("🚀 ENVIANDO PETICIÓN A CELERY (MULTI-PERSONA):", {
        video_id: createdVideoId, modo_comportamiento: mode, motor_ia: poseMode,
        salto_frames: framesSkip, confianza_exigida: confidenceThreshold
      });

      await api.post(`/api/analysis/videos/${createdVideoId}/process/`, {
        mode, dimension: poseMode, fps_skip: framesSkip, confidence_threshold: confidenceThreshold,
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

            // =================================================================
            // RASTREADOR 2: Resultado recibido
            // =================================================================
            console.log("✅ ANÁLISIS MULTI-PERSONA COMPLETADO:", resStatus);

            const streamUrl = resStatus.stream_url || resStatus.video_url || resStatus.download_url || resStatus.rutaVideoProcesado || resStatus.rutaArchivoProcesado || null;
            if (streamUrl) setDownloadUrl(resolveUrl(streamUrl));

            const ruta = resStatus.analysis_report?.rutaJsonKeypoints || `reports/keypoints_video_${createdVideoId}.json`;
            await loadKeypointsJson(ruta);
            
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
          window.clearInterval(intervalId);
          setIsProcessing(false);
          setErrorMessage('Se perdió la conexión.');
        }
      }, 3000);
    } catch (error: any) {
      setIsProcessing(false);
      setProgress(0);
      setErrorMessage(error?.response?.mensaje || error?.message || 'Error al enviar video');
    }
  };

  const handleReuploadClick = async () => {
    if (currentVideoIdRef.current) {
      try { await api.del(`/api/analysis/media/videos/${currentVideoIdRef.current}/`); } catch (error) {}
      currentVideoIdRef.current = null;
    }
    setFile(null); setVideoUrl(null); setIsProcessing(false); setProgress(0);
    setAnalysisResults(null); setAnalysisReport(null); setJsonKeypointsUrl(null);
    setKeypointsData(null); setDetailedDetections([]); setErrorMessage(null);
    setDownloadUrl(null); setProcessedStreamUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    file, videoUrl, isProcessing, progress, mode, setMode, framesSkip, setFramesSkip,
    poseMode, setPoseMode, confidenceThreshold, setConfidenceThreshold, processedStreamUrl,
    downloadUrl, analysisResults, analysisReport, jsonKeypointsUrl, keypointsData,
    detailedDetections, errorMessage, fileInputRef, handleFileChange, handleProcessVideo,
    handleReuploadClick
  };
};