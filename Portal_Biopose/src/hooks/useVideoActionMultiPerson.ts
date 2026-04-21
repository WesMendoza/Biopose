import { useState, useRef } from 'react';

export const useVideoActionMultiPerson = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationMode, setOperationMode] = useState<string>('Modo Operativo (Por defecto)');
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
    }
  };

  const handleProcessVideo = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const handleReuploadClick = () => {
    setFile(null);
    setVideoUrl(null);
    setIsProcessing(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    file,
    videoUrl,
    isProcessing,
    progress,
    operationMode, setOperationMode,
    poseMode, setPoseMode,
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick
  };
};