import { useRef, useState, useEffect } from 'react';
import { API_BASE } from '../config'; 
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export const useGenerarImagenes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(5);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(300);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [keypointsData, setKeypointsData] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);
  const [videoId, setVideoId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // REFERENCIA SECRETA: Guarda el ID del video actual para poder borrarlo
  const currentVideoIdRef = useRef<string | number | null>(null);

  // =========================================================================
  // LIMPIEZA AUTOMÁTICA AL SALIR DE LA PANTALLA
  // =========================================================================
  useEffect(() => {
    return () => {
      if (currentVideoIdRef.current) {
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

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decoded: any = jwtDecode(token);
        const idEmpresa = decoded.idEmpresa;
        const response = await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
        if (Array.isArray(response)) {
            const fpsConfig = response.find((item: any) => item.codigo === 'FPS_DEFAULT');
            if (fpsConfig) setFps(Number(fpsConfig.valor));
        }
      } catch (error) { console.error("Error:", error); }
    };
    cargarConfiguracion();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setIsProcessing(false); setKeypointsData([]); setResultsData(null); setErrorMessage(null); setVideoId(null);
    }
  };

  // =========================================================================
  // LIMPIEZA MANUAL AL CERRAR MODAL O CARGAR NUEVO VIDEO
  // =========================================================================
  const handleReuploadClick = async () => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    
    if (currentVideoIdRef.current) {
      try {
        await api.del(`/api/analysis/media/videos/${currentVideoIdRef.current}/`);
      } catch (error) {}
      currentVideoIdRef.current = null;
    }

    setFile(null); setVideoUrl(null); setIsProcessing(false); setIsModalOpen(false);
    setKeypointsData([]); setResultsData(null); setErrorMessage(null); setVideoId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateImages = async () => {
    if (!file) return;
    
    setErrorMessage(null); setIsProcessing(true);
    const fd = new FormData(); fd.append('video', file);

    try {
      const resUpload = await api.postForm('/api/analysis/media/videos/upload/', fd);
      const createdVideoId = resUpload?.idVideoUpload || resUpload?.id || resUpload?.video_id;
      if (!createdVideoId) throw new Error('No se recibió el ID.');
      
      setVideoId(createdVideoId);
      currentVideoIdRef.current = createdVideoId;

      await api.post(`/api/analysis/videos/${createdVideoId}/process/`, { fps_skip: fps });

      const pollResults = async () => {
        try {
          const resStatus = await api.get(`/api/analysis/videos/${createdVideoId}/results/`);
          const currentStatus = (resStatus?.status || '').toLowerCase();

          if (currentStatus === 'completed') {
            setIsProcessing(false);
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            setResultsData(resStatus.analysis_report || resStatus);

            try {
              const jsonUrl = resStatus.analysis_report?.rutaJsonKeypoints 
                ? resolveUrl(`media/${resStatus.analysis_report.rutaJsonKeypoints}?t=${new Date().getTime()}`)
                : resolveUrl(`media/reports/keypoints_video_${createdVideoId}.json?t=${new Date().getTime()}`);

              const response = await fetch(jsonUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const keypointsRes = await response.json();

              let framesData = [];
              if (Array.isArray(keypointsRes)) {
                  framesData = keypointsRes;
              } else if (keypointsRes && typeof keypointsRes === 'object') {
                  framesData = keypointsRes.keypoints || keypointsRes.keypoints_data || [];
              }

              setKeypointsData(framesData);
              
              if (framesData.length > 0) setIsModalOpen(true);
              else setErrorMessage("El análisis terminó, pero no se detectaron poses humanas.");
              
            } catch (err) { 
                setErrorMessage("Falló la lectura del archivo JSON en el servidor."); 
                console.error(err);
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
          setErrorMessage('Se perdió la conexión al consultar el estado.');
        }
      };

      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = setTimeout(pollResults, 5000);

    } catch (error: any) {
      setIsProcessing(false); setErrorMessage(error?.message || 'Error al comunicarse');
    }
  };

  const handleSaveResults = async () => {
    if (!videoId || keypointsData.length === 0) {
      alert("Faltan datos para descargar la colección de fotogramas.");
      return;
    }
    try {
      alert("Preparando el ZIP de descarga... Esto puede tardar unos segundos dependiendo de la cantidad de frames.");
      
      const blob = await api.postBlob(`/api/analysis/videos/${videoId}/save-to-disk/`, {
        fps_usados: fps,
        width: width,
        height: height,
        results: keypointsData 
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dataset_VideoFrames_${videoId}.zip`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("¡Colección de fotogramas descargada exitosamente!");
      
      // MAGIA: Ejecutamos la limpieza total tras una descarga exitosa
      handleReuploadClick(); 
    } catch (error: any) {
      console.error("Error al descargar el ZIP:", error);
      alert("Error al intentar descargar los archivos en formato ZIP.");
    }
  };

  return {
    file, videoUrl, fps, setFps, width, setWidth, height, setHeight,
    isProcessing, isModalOpen, setIsModalOpen,
    keypointsData, setKeypointsData, 
    resultsData, errorMessage,
    fileInputRef, handleFileChange, handleGenerateImages, handleReuploadClick, handleSaveResults
  };
};