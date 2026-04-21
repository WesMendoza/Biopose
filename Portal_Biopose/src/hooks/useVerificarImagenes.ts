import { useState } from 'react';

export const useVerificarImagenes = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorPath, setErrorPath] = useState(false);
  const [errorFile, setErrorFile] = useState(false);

  const paths = [
    { id: 1, name: '/videos/test1' },
    { id: 2, name: '/videos/training' },
  ];

  const files = [
    { id: 1, name: 'frame_001.jpg', pathId: 1 },
    { id: 2, name: 'frame_002.jpg', pathId: 1 },
    { id: 3, name: 'training_img1.jpg', pathId: 2 },
  ];

  // Filtern files based on selected path
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

    // Simulate loading the image
    const fileName = availableFiles.find(f => f.id === Number(selectedFile))?.name;
    setImageUrl(`https://via.placeholder.com/600x400.png?text=Simulated+Image:+${fileName}`);
  };

  return {
    selectedPath, setSelectedPath,
    selectedFile, setSelectedFile,
    imageUrl, setImageUrl,
    errorPath, setErrorPath,
    errorFile, setErrorFile,
    paths,
    availableFiles,
    handleLoadImage
  };
};