import { useState, useRef } from 'react';

export const useVerificarImagenes = () => {
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorFile, setErrorFile] = useState(false);
  
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [poseResults, setPoseResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);

  // 1. Lee la carpeta seleccionada (Lote completo de imágenes y JSONs)
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const pathParts = files[0].webkitRelativePath.split('/');
    if (pathParts.length > 0) {
      setFolderName(pathParts[0]);
    }

    // Guardamos TODOS los archivos (.jpg, .json) en memoria local
    setLocalFiles(files);
    setImageUrl(null);
    setPoseResults(null);
    setSelectedFile('');

    // Extraer solo las imágenes para el Dropdown
    const imageFiles = files.filter(f => f.name.match(/\.(jpg|jpeg|png)$/i));
    const sortedImages = imageFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    setAvailableFiles(sortedImages.map(f => ({ id: f.name, name: f.name })));
  };

  // 2. Cargar la imagen y leer SU PROPIO JSON
  const handleLoadImage = () => {
    if (!selectedFile) {
      setErrorFile(true);
      return;
    }
    setErrorFile(false);
    setIsLoading(true);

    const fileObj = localFiles.find(f => f.name === selectedFile);
    if (!fileObj) {
      setIsLoading(false);
      return;
    }

    const url = URL.createObjectURL(fileObj);
    setImageUrl(url);

    // === LÓGICA CORREGIDA PARA BATCH OFFLINE ===
    // 1. Buscar el JSON que se llame igual que la imagen (ej: 0002.jpg -> 0002.json)
    const baseName = selectedFile.substring(0, selectedFile.lastIndexOf('.'));
    const matchedJsonFile = localFiles.find(f => f.name === `${baseName}.json`);

    // 2. Si no existe un JSON individual, buscar si hay un "maestro" (para videos antiguos)
    let jsonToRead = matchedJsonFile;
    if (!jsonToRead && selectedFile.includes('_frame_')) {
      const videoBaseName = baseName.split('_frame_')[0];
      jsonToRead = localFiles.find(f => f.name === `${videoBaseName}.json`);
    }

    // 3. Procesar el JSON encontrado
    if (jsonToRead) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          // CASO A: Es un fotograma de video (lote unificado)
          if (selectedFile.includes('_frame_')) {
            const match = selectedFile.match(/_frame_(\d+)/);
            if (match) {
              const frameIdx = parseInt(match[1], 10) - 1;
              let framesList = Array.isArray(parsed) ? parsed : (parsed.keypoints_data || parsed.keypoints || parsed.frames || parsed.data || []);
              
              if (framesList[frameIdx]) {
                let frameInfo = framesList[frameIdx];
                let rawPts = typeof frameInfo === 'string' ? JSON.parse(frameInfo) : frameInfo;
                let ptsArray = rawPts.keypoints_json || rawPts.keypoints || rawPts;
                
                if (typeof ptsArray === 'string') {
                  try { ptsArray = JSON.parse(ptsArray); } catch(e) { ptsArray = []; }
                }

                let personsList: any[] = [];
                if (Array.isArray(ptsArray)) {
                  if (ptsArray.length > 0 && Array.isArray(ptsArray[0])) {
                    ptsArray.forEach((p, i) => personsList.push({ person_id: i, keypoints: p }));
                  } else {
                    personsList.push({ person_id: 0, keypoints: ptsArray });
                  }
                }

                setPoseResults({
                  model_used: parsed.model_used || "YOLOv8-pose (Video)",
                  persons_detected: personsList.length,
                  persons: personsList
                });
              } else {
                setPoseResults(null);
              }
            }
          } else {
            // CASO B: Es una imagen de Batch normal (Cada .jpg tiene su .json)
            setPoseResults(parsed);
          }
        } catch (err) {
          console.error("Error al parsear el JSON individual:", err);
          setPoseResults(null);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(jsonToRead);
    } else {
      // No se encontró ningún JSON para esta imagen
      setPoseResults(null);
      setIsLoading(false);
    }
  };

return {
    folderName,
    selectedFile, setSelectedFile,
    imageUrl, setImageUrl,
    errorFile, setErrorFile,
    availableFiles,
    poseResults, 
    setPoseResults,
    isLoading,
    handleLoadImage,
    handleFolderSelect,
    folderInputRef
  };
};