import { useState, useEffect } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export const useVerificarImagenes = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorPath, setErrorPath] = useState(false);
  const [errorFile, setErrorFile] = useState(false);
  
  const [paths, setPaths] = useState<any[]>([]);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  
  // NUEVOS ESTADOS PARA LOS PUNTOS DE LA IMAGEN
  const [poseResults, setPoseResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Cargar las rutas de la BD de la empresa al iniciar
  useEffect(() => {
    const cargarRutas = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decoded: any = jwtDecode(token);
        const idEmpresa = decoded.idEmpresa;
        const response = await api.get(`/api/menuOpciones/rutas/configurar/?idEmpresa=${idEmpresa}`);
        if (Array.isArray(response)) {
          const soloSubRutas = response.filter((item: any) => item.codigo && item.codigo.startsWith('SUBRUTA_'));
          setPaths(soloSubRutas.map(r => ({ id: r.valor, name: r.valor })));
        }
      } catch (error) {
        console.error("Error al cargar rutas:", error);
      }
    };
    cargarRutas();
  }, []);

  // 2. Cuando cambie la ruta, pedir a Django los archivos .jpg de esa carpeta
  useEffect(() => {
    if (!selectedPath) {
      setAvailableFiles([]);
      setSelectedFile('');
      return;
    }
    const fetchFiles = async () => {
      try {
        const response = await api.post('/api/analysis/pose/local-files/', { target_path: selectedPath });
        setAvailableFiles(response || []);
      } catch (error) {
        console.error("Error al listar archivos locales", error);
        setAvailableFiles([]);
      }
    };
    fetchFiles();
  }, [selectedPath]);

  // 3. Al hacer clic en "Cargar", traer la imagen y el JSON
  const handleLoadImage = async () => {
    let hasError = false;
    if (!selectedPath) { setErrorPath(true); hasError = true; } else { setErrorPath(false); }
    if (!selectedFile) { setErrorFile(true); hasError = true; } else { setErrorFile(false); }
    if (hasError) return;

    setIsLoading(true);
    setPoseResults(null);
    setImageUrl(null);

    try {
      const response = await api.post('/api/analysis/pose/local-file-data/', {
        target_path: selectedPath,
        file_name: selectedFile
      });
      
      setImageUrl(response.image_b64);
      setPoseResults(response.json_data);
    } catch (error) {
      console.error("Error al cargar datos del archivo", error);
      alert("Hubo un error al leer la imagen o su JSON correspondiente.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedPath, setSelectedPath,
    selectedFile, setSelectedFile,
    imageUrl, setImageUrl,
    errorPath, setErrorPath,
    errorFile, setErrorFile,
    paths,
    availableFiles,
    poseResults,
    isLoading,
    handleLoadImage
  };
};