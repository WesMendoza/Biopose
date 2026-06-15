import { useState, useRef } from 'react';

export const useVerificarImagenes = () => {
  // Estados para manejar la memoria local
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [masterJson, setMasterJson] = useState<any>(null);
  const [folderName, setFolderName] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorFile, setErrorFile] = useState(false);
  
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [poseResults, setPoseResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);

  // 1. Lee la carpeta seleccionada en Windows/Mac
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Obtener el nombre de la carpeta principal
    const pathParts = files[0].webkitRelativePath.split('/');
    if (pathParts.length > 0) {
      setFolderName(pathParts[0]);
    }

    setLocalFiles(files);
    setImageUrl(null);
    setPoseResults(null);
    setSelectedFile('');

    // 2. Buscar el archivo JSON en toda la carpeta
    const jsonFile = files.find(f => f.name.endsWith('.json'));
    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setMasterJson(parsed);
        } catch (err) {
          console.error("Error al leer JSON:", err);
          alert("El archivo JSON está corrupto o es inválido.");
        }
      };
      reader.readAsText(jsonFile);
    } else {
      setMasterJson(null);
      alert("Advertencia: No se encontró ningún archivo .json en esta carpeta. Solo podrás ver las imágenes sin los puntos articulados.");
    }

    // 3. Filtrar y ordenar las imágenes (.jpg, .png, .jpeg)
    const imageFiles = files.filter(f => f.name.match(/\.(jpg|jpeg|png)$/i));
    const sortedImages = imageFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    setAvailableFiles(sortedImages.map(f => ({ id: f.name, name: f.name })));
  };

  // 4. Cargar la imagen y buscar sus puntos en la memoria
  const handleLoadImage = () => {
    if (!selectedFile) {
      setErrorFile(true);
      return;
    }
    setErrorFile(false);
    setIsLoading(true);

    // Buscar el archivo físico en la memoria
    const fileObj = localFiles.find(f => f.name === selectedFile);
    if (!fileObj) {
      setIsLoading(false);
      return;
    }

    // Crear una URL temporal en el navegador para mostrar la foto instantáneamente
    const url = URL.createObjectURL(fileObj);
    setImageUrl(url);

    // LÓGICA INTELIGENTE (Migrada de Django a JS)
    if (masterJson) {
      // CASO A: Es un fotograma de video (Ej: 00001_frame_001.jpg)
      if (selectedFile.includes('_frame_')) {
        const match = selectedFile.match(/_frame_(\d+)/);
        if (match) {
          const frameIdx = parseInt(match[1], 10) - 1; // Índice base 0
          
          let framesList = [];
          if (Array.isArray(masterJson)) {
            framesList = masterJson;
          } else {
            framesList = masterJson.keypoints_data || masterJson.keypoints || masterJson.frames || masterJson.data || [];
          }

          if (framesList[frameIdx]) {
            let frameInfo = framesList[frameIdx];
            let rawPts = typeof frameInfo === 'string' ? JSON.parse(frameInfo) : frameInfo;
            
            let ptsArray = rawPts.keypoints_json || rawPts.keypoints || rawPts;
            if (typeof ptsArray === 'string') {
              try { ptsArray = JSON.parse(ptsArray); } catch(e) { ptsArray = []; }
            }

            let personsList: any[] = [];
            if (Array.isArray(ptsArray)) {
              // Si es un arreglo de arreglos (multipersona)
              if (ptsArray.length > 0 && Array.isArray(ptsArray[0])) {
                ptsArray.forEach((p, i) => personsList.push({ person_id: i, keypoints: p }));
              } else {
                // Una sola persona
                personsList.push({ person_id: 0, keypoints: ptsArray });
              }
            }

            setPoseResults({
              model_used: masterJson.model_used || "YOLOv8-pose (Video)",
              persons_detected: personsList.length,
              persons: personsList
            });
          } else {
            setPoseResults(null);
          }
        }
      } else {
        // CASO B: Es una imagen estática (El JSON pertenece solo a esta foto)
        setPoseResults(masterJson);
      }
    } else {
      setPoseResults(null);
    }

    setIsLoading(false);
  };

  return {
    folderName,
    selectedFile, setSelectedFile,
    imageUrl, setImageUrl,
    errorFile, setErrorFile,
    availableFiles,
    poseResults,
    isLoading,
    handleLoadImage,
    handleFolderSelect,
    folderInputRef
  };
};