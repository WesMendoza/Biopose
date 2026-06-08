import { useState, useEffect } from 'react';

export const useVerificarImagenes = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorPath, setErrorPath] = useState(false);
  const [errorFile, setErrorFile] = useState(false);
  
  // NUEVO: Estado para almacenar las rutas dinámicas
  const [paths, setPaths] = useState<any[]>([]);

  // NUEVO: Leemos las rutas reales guardadas en la configuración al montar el componente
  useEffect(() => {
    const savedRoutes = localStorage.getItem('biopose_routes');
    if (savedRoutes) {
      const parsedRoutes = JSON.parse(savedRoutes).map((r: any) => ({
        id: r.id, 
        name: r.directory 
      }));
      setPaths(parsedRoutes);
    }
  }, []);

  // Archivos simulados (luego esto vendrá de tu backend)
  const files = [
    { id: 1, name: 'frame_001.jpg', pathId: 1 },
    { id: 2, name: 'frame_002.jpg', pathId: 1 },
    { id: 3, name: 'training_img1.jpg', pathId: 2 },
  ];

  // Filtrar archivos según la ruta seleccionada
  const availableFiles = files.filter(f => selectedPath && f.pathId === Number(selectedPath));

  const handleLoadImage = () => {
    let hasError = false;
    if (!selectedPath) {
      setErrorPath(true);
      hasError = true;
    } else {
      setErrorPath(false);
    }

    if (!selectedFile) {
      setErrorFile(true);
      hasError = true;
    } else {
      setErrorFile(false);
    }

    if (hasError) return;

    // Simular la carga de la imagen
    const fileName = availableFiles.find(f => f.id === Number(selectedFile))?.name;
    setImageUrl(`https://via.placeholder.com/600x400.png?text=Simulated+Image:+${fileName}`);
  };

  return {
    selectedPath, setSelectedPath,
    selectedFile, setSelectedFile,
    imageUrl, setImageUrl,
    errorPath, setErrorPath,
    errorFile, setErrorFile,
    paths, // <-- Ahora exporta las rutas dinámicas
    availableFiles,
    handleLoadImage
  };
};