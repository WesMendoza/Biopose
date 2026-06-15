import { useRef, useState, useEffect } from 'react';
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

  // === RUTAS COMENTADAS ===
  // const [selectedPath, setSelectedPath] = useState('');
  // const [paths, setPaths] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decoded: any = jwtDecode(token);
        const idEmpresa = decoded.idEmpresa;
        const response = await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
        if (Array.isArray(response)) {
            // === RUTAS COMENTADAS ===
            // const soloSubRutas = response.filter((item: any) => item.codigo && item.codigo.startsWith('SUBRUTA_'));
            // setPaths(soloSubRutas);
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

  const handleReuploadClick = () => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    setFile(null); setVideoUrl(null); setIsProcessing(false); setIsModalOpen(false);
    setKeypointsData([]); setResultsData(null); setErrorMessage(null); setVideoId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateImages = async () => {
    if (!file) return;
    
    // === VALIDACIÓN DE RUTA COMENTADA ===
    // if (!selectedPath) { alert("Por favor selecciona una ruta de guardado."); return; }

    setErrorMessage(null); setIsProcessing(true);
    const fd = new FormData(); fd.append('video', file);

    try {
      const resUpload = await api.postForm('/api/analysis/media/videos/upload/', fd);
      const createdVideoId = resUpload?.idVideoUpload || resUpload?.id || resUpload?.video_id;
      if (!createdVideoId) throw new Error('No se recibió el ID.');
      setVideoId(createdVideoId);

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
              const keypointsRes = await api.get(`/api/analysis/videos/${createdVideoId}/keypoints-json/`);
              const framesData = keypointsRes.keypoints_data || keypointsRes.keypoints || keypointsRes.frames || keypointsRes.data || (Array.isArray(keypointsRes) ? keypointsRes : []);
              setKeypointsData(framesData);
              if (framesData.length > 0) setIsModalOpen(true);
              else setErrorMessage("No se detectaron poses.");
            } catch (err) { setErrorMessage("Falló la descarga de coordenadas."); }
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
      setIsProcessing(false); setErrorMessage(error?.message || 'Error al comunicarse');
    }
  };

  const handleSaveResults = async () => {
    // Validamos solo que haya un ID de video y datos extraídos
    if (!videoId || keypointsData.length === 0) {
      alert("Faltan datos para descargar la colección de fotogramas.");
      return;
    }
    try {
      alert("Preparando el ZIP de descarga... Esto puede tardar unos segundos dependiendo de la cantidad de frames.");
      
      // 1. Usamos nuestro api.postBlob para traer el ZIP
      const blob = await api.postBlob(`/api/analysis/videos/${videoId}/save-to-disk/`, {
        // target_path: selectedPath, // YA NO ENVIAMOS ESTO
        fps_usados: fps,
        width: width,
        height: height,
        results: keypointsData 
      });

      // 2. Creamos la URL temporal
      const url = window.URL.createObjectURL(blob);
      
      // 3. Forzamos la descarga nativa
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dataset_VideoFrames_${videoId}.zip`);
      document.body.appendChild(link);
      link.click();
      
      // 4. Limpiamos la memoria
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("¡Colección de fotogramas descargada exitosamente!");
      setIsModalOpen(false);
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
    // selectedPath, setSelectedPath, paths, // === COMENTADO ===
    fileInputRef, handleFileChange, handleGenerateImages, handleReuploadClick, handleSaveResults
  };
};