import { useState } from 'react';

export const useLiveActionMultiPerson = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [operationMode, setOperationMode] = useState<string>('Modo Operativo (Por defecto)');
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  return {
    isStreaming, setIsStreaming,
    operationMode, setOperationMode,
    poseMode, setPoseMode,
    toggleStream
  };
};