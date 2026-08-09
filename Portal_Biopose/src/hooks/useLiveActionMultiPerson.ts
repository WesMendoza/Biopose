import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../config'; 

// =========================================================================
// TIPOS
// =========================================================================
export interface RealtimeActionDetection {
  behavior: string;
  label: string;
  timestamp?: number;
}

export interface FinalActionDetection {
  tipo_evento: string;
  confianza: number;
  frame_inicio: number;
  frame_fin: number;
  segundo_inicio: number;
  segundo_fin: number;
  personas_involucradas: number;
  detalles?: any;
}

const ACTION_LABELS: Record<string, string> = {
  PELEAR: 'Pelea',
  DISTURBIO: 'Disturbio',
};

// =========================================================================
// HOOK
// =========================================================================
export const useLiveActionMultiPerson = () => {
  // --- Estado de la UI ---
  const [isStreaming, setIsStreaming] = useState(false);
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const [operationMode, setOperationMode] = useState<string>('Modo Operativo (Por defecto)');
  const [deviceType, setDeviceType] = useState<'local' | 'remote'>('local');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- Estado de detecciones ---
  const [realtimeDetections, setRealtimeDetections] = useState<RealtimeActionDetection[]>([]);
  const [finalDetections, setFinalDetections] = useState<FinalActionDetection[]>([]);
  const [numPeople, setNumPeople] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // --- Referencias para Renderizado y Lógica ---
  const imgRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const frameIntervalRef = useRef<number | null>(null);
  const clearAlertsTimeoutRef = useRef<number | null>(null);
  const seenBehaviorsRef = useRef<Set<string>>(new Set());

  // =======================================================================
  // INICIAR STREAM REMOTO (SSE)
  // =======================================================================
  const startRemoteStream = useCallback(() => {
    try {
      const source = new EventSource(`${API_BASE}/api/analysis/live/stream-multiperson/?source=remote&url=${encodeURIComponent(remoteUrl)}&fps_skip=${framesSkip}&mode=${poseMode}&visual_mode=${encodeURIComponent(operationMode)}`);
      eventSourceRef.current = source;

      source.onopen = () => setIsStreaming(true);

      source.onmessage = (event) => {
        if (event.data === 'EOF') {
          stopStream();
          setIsFinished(true);
          return;
        }

        try {
          const data = JSON.parse(event.data);

          if (data.final_detections) {
            setFinalDetections(data.final_detections);
            return;
          }

          if (data.error) {
            setError(data.error);
            stopStream();
            return;
          }

          if (data.frame && imgRef.current) {
            const canvas = imgRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
              };
              img.src = 'data:image/jpeg;base64,' + data.frame;
            }
          }

        if (data.num_people !== undefined) {
          setNumPeople(data.num_people);
        }

        if (data.detections && Array.isArray(data.detections)) {
          data.detections.forEach((behavior: string) => {
            if (!seenBehaviorsRef.current.has(behavior)) {
              seenBehaviorsRef.current.add(behavior);
              setRealtimeDetections(prev => [
                ...prev,
                { behavior, label: ACTION_LABELS[behavior] || behavior }
              ]);
            }
          });
        }
      } catch (e) {
        // Parse error ignore
      }
    };

    source.onerror = () => {
      stopStream();
      if (!isFinished) setError('Se perdió la conexión con el servidor.');
    };
    } catch (e) {
      setError("Error al iniciar la conexión remota.");
      console.error(e);
    }
  }, [framesSkip, poseMode, remoteUrl, operationMode]);

  // =======================================================================
  // INICIAR STREAM LOCAL (WebSockets + getUserMedia)
  // =======================================================================
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws/live-action-multiperson/';
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        setIsStreaming(true);
        
        const sendFrame = () => {
          if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (video.videoWidth > 0 && video.videoHeight > 0 && ctx) {
              const MAX_WIDTH = 640;
              const scale = Math.min(MAX_WIDTH / video.videoWidth, 1);
              
              canvas.width = video.videoWidth * scale;
              canvas.height = video.videoHeight * scale;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
              const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
              
              ws.send(JSON.stringify({
                frame: base64Data,
                fps_skip: framesSkip,
                mode: poseMode,
                visual_mode: operationMode
              }));
            } else {
              frameIntervalRef.current = window.setTimeout(sendFrame, 50);
            }
          }
        };

        sendFrame();

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'result') {
               if (data.frame && imgRef.current) {
                 const canvas = imgRef.current;
                 const ctx = canvas.getContext('2d');
                 if (ctx) {
                   const img = new Image();
                   img.onload = () => {
                     canvas.width = img.width;
                     canvas.height = img.height;
                     ctx.drawImage(img, 0, 0);
                   };
                   img.src = 'data:image/jpeg;base64,' + data.frame;
                 }
               }
               if (data.num_people !== undefined) {
                 setNumPeople(data.num_people);
               }
               if (data.detections && Array.isArray(data.detections) && data.detections.length > 0) {
                 const currentFrameDetections = data.detections.map((behavior: string) => ({
                   behavior, 
                   label: ACTION_LABELS[behavior] || behavior
                 }));
                 setRealtimeDetections(currentFrameDetections);
                 
                 // Limpiar cualquier timeout pendiente ya que recibimos una nueva detección
                 if (clearAlertsTimeoutRef.current) {
                   window.clearTimeout(clearAlertsTimeoutRef.current);
                   clearAlertsTimeoutRef.current = null;
                 }
               } else {
                 // Si no hay personas, limpiar instantáneamente
                 if (data.num_people === 0) {
                   if (clearAlertsTimeoutRef.current) {
                     window.clearTimeout(clearAlertsTimeoutRef.current);
                     clearAlertsTimeoutRef.current = null;
                   }
                   setRealtimeDetections([]);
                 } else {
                   // Hay personas, pero no hay detección, aplicar debouncer para evitar parpadeos
                   if (!clearAlertsTimeoutRef.current) {
                     clearAlertsTimeoutRef.current = window.setTimeout(() => {
                       setRealtimeDetections([]);
                       clearAlertsTimeoutRef.current = null;
                     }, 2000);
                   }
                 }
               }

               frameIntervalRef.current = window.setTimeout(sendFrame, 10);

            } else if (data.type === 'final') {
               setFinalDetections(data.detections || []);
            } else if (data.error) {
               setError(data.error);
               stopStream();
            }
          } catch (e) {
            // Ignorar
          }
        };
      };

      ws.onerror = () => {
        setError('Error en la conexión WebSocket.');
        stopStream();
      };
      
      ws.onclose = () => {
        if (isStreaming) {
           stopStream();
           setIsFinished(true);
        }
      };

    } catch (err) {
      console.error(err);
      setError('No se pudo acceder a la cámara web. Verifique los permisos del navegador.');
      setIsStreaming(false);
    }
  }, [framesSkip, poseMode, operationMode]);

  // =======================================================================
  // INICIAR (LÓGICA CENTRAL)
  // =======================================================================
  const startStream = useCallback(() => {
    setError(null);
    setIsFinished(false);
    setRealtimeDetections([]);
    setFinalDetections([]);
    setNumPeople(0);
    seenBehaviorsRef.current = new Set();
    
    if (deviceType === 'remote') {
      startRemoteStream();
    } else {
      startLocalStream();
    }
  }, [deviceType, startRemoteStream, startLocalStream]);

  // =======================================================================
  // DETENER STREAM
  // =======================================================================
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  }, []);

  // =======================================================================
  // TOGGLE Y REINICIAR
  // =======================================================================
  const toggleStream = useCallback(() => {
    if (isStreaming) {
      stopStream();
      setIsFinished(true);
    } else {
      startStream();
    }
  }, [isStreaming, stopStream, startStream]);

  const resetAll = useCallback(() => {
    stopStream();
    setRealtimeDetections([]);
    setFinalDetections([]);
    setNumPeople(0);
    setError(null);
    setIsFinished(false);
    seenBehaviorsRef.current = new Set();
    if (imgRef.current) {
      const canvas = imgRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [stopStream]);

  const isValidRemoteUrl = useCallback((url: string) => {
    const regex = /^(rtsp|http|https):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
  }, []);

  return {
    isStreaming,
    isFinished,
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    operationMode, setOperationMode,
    deviceType, setDeviceType,
    remoteUrl, setRemoteUrl,
    error,
    numPeople,
    realtimeDetections,
    finalDetections,
    
    imgRef,
    videoRef,
    canvasRef,

    toggleStream,
    resetAll,
    isValidRemoteUrl,
  };
};