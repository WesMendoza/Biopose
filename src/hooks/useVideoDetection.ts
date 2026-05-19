import { useState, useRef } from 'react';
import api from '../lib/api';

export const useVideoDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [framesSkip, setFramesSkip] = useState(3);
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

    const fd = new FormData();
    fd.append('video', file);

    api.postForm('/api/analysis/videos/upload/', fd)
      .then((res) => {
        const videoId = res?.detalle?.id || res?.detalle?.video_id || null;
        // If backend returns id, trigger processing endpoint
        if (videoId) {
          api.post(`/api/analysis/videos/${videoId}/process/`, { fps_skip: framesSkip, dimension: poseMode })
            .catch(() => {});
        }
        // simulate progress until results available
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsProcessing(false);
              return 100;
            }
            return prev + 10;
          });
        }, 600);
      })
      .catch(() => {
        // fallback to local simulation
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsProcessing(false);
              return 100;
            }
            return prev + 10;
          });
        }, 600);
      });
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
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    fileInputRef,
    handleFileChange,
    handleProcessVideo,
    handleReuploadClick
  };
};