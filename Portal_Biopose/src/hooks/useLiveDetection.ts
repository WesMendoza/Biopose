import { useState } from 'react';

export const useLiveDetection = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  return {
    isStreaming, setIsStreaming,
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    toggleStream
  };
};