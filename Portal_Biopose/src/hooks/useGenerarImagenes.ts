import { useState, useRef } from 'react';
import api from '../lib/api';

export const useGenerarImagenes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fps, setFps] = useState(3);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(445);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
    }
  };

  const handleGenerateImages = () => {
    if (!file) return;
    setIsProcessing(true);

    const fd = new FormData();
    fd.append('video', file);
    fd.append('fps', String(fps));
    fd.append('width', String(width));
    fd.append('height', String(height));

    api.postForm('/api/analysis/videos/upload/', fd)
      .then((res) => {
        // open modal with results available later
        setIsModalOpen(true);
      })
      .catch(() => {
        // fallback simulation
        setTimeout(() => setIsModalOpen(true), 1200);
      })
      .finally(() => setIsProcessing(false));
  };

  return {
    file,
    videoUrl,
    fps, setFps,
    width, setWidth,
    height, setHeight,
    isProcessing,
    isModalOpen, setIsModalOpen,
    fileInputRef,
    handleFileChange,
    handleGenerateImages
  };
};