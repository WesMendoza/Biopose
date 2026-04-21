import { useState, useRef } from 'react';

export const useCargaImagen = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(445);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPoseModalOpen, setIsPoseModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
    }
  };

  const handleProcessClick = () => {
    if (!file) return;
    setIsPreviewModalOpen(true);
  };

  const handleGeneratePose = () => {
    setIsPreviewModalOpen(false);
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsPoseModalOpen(true);
    }, 1500);
  };

  return {
    file,
    imageUrl,
    width,
    setWidth,
    height,
    setHeight,
    isProcessing,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isPoseModalOpen,
    setIsPoseModalOpen,
    fileInputRef,
    handleFileChange,
    handleProcessClick,
    handleGeneratePose
  };
};