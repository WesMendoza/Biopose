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
  
  // === RUTAS COMENTADAS ===
  // const [selectedPath, setSelectedPath] = useState('');
  // const [paths, setPaths] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cargarRutas = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const decoded: any = jwtDecode(token);
        const idEmpresa = decoded.idEmpresa;
        
        const response = await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
        if (Array.isArray(response)) {
            // === RUTAS COMENTADAS ===
            // const soloSubRutas = response.filter((item: any) => 
            //     item.codigo && item.codigo.startsWith('SUBRUTA_')
            // );
            // setPaths(soloSubRutas);
        }
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
    
    // === VALIDACIÓN DE RUTA COMENTADA ===
    // if (!selectedPath) {
    //   alert("Por favor selecciona una ruta de guardado antes de procesar.");
    //   return;
    // }

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

  const handleSaveResults = async () => {
    // === VALIDACIÓN MODIFICADA (Ya no exige selectedPath) ===
    if (!imageId || !poseResults) {
      alert("Faltan datos de configuración o análisis previo para guardar.");
      return;
    }

    try {
      // 1. Usamos api.postBlob para descargar el ZIP desde el backend
      const blob = await api.postBlob(`/api/analysis/pose/image/${imageId}/save-to-disk/`, {
        // target_path: selectedPath, // YA NO ENVIAMOS ESTO
        results: poseResults
      });
      
      // 2. Creamos una URL temporal
      const url = window.URL.createObjectURL(blob);
      
      // 3. Forzamos la descarga en el navegador
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dataset_Imagen_${imageId}.zip`);
      document.body.appendChild(link);
      link.click();
      
      // 4. Limpieza de memoria
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("¡Dataset descargado exitosamente!");
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
    imageId, 
    // selectedPath, setSelectedPath, paths, // === COMENTADO ===
    fileInputRef, handleFileChange, handleProcessClick,
    handleGeneratePose, handleSaveResults
  };
};