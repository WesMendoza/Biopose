import { useState, useRef } from 'react';
import api from '../lib/api';

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
    if (!file) return;
    setIsPreviewModalOpen(false);
    setIsProcessing(true);

    const fd = new FormData();
    fd.append('image', file);

    api.postForm('/api/analysis/images/upload/', fd)
      .then((res) => {
        // try to extract URL from response
        const url = res?.detalle?.url || res?.detalle?.path || null;
        if (url) setImageUrl(url);
        setIsPoseModalOpen(true);
      })
      .catch(() => {
        // fallback to local simulated pose
        setTimeout(() => setIsPoseModalOpen(true), 800);
      })
      .finally(() => setIsProcessing(false));
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