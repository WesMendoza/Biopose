import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../config'; 

// =========================================================================
// TIPOS
// =========================================================================
export interface RealtimeDetection {
  behavior: string;
  label: string;
  timestamp?: number;
}

export interface FinalDetection {
  timestamp: number;
  behaviors: string[];
}

// Mapeo de etiquetas internas a nombres legibles
const BEHAVIOR_LABELS: Record<string, string> = {
  hidden_hands: 'Manos ocultas detrás',
  excessive_gaze: 'Mirada excesiva / Giros bruscos',
  hand_under_clothes: 'Mano bajo ropa',
};

// =========================================================================
// HOOK
// =========================================================================
export const useLiveDetection = () => {
  // --- Estado de la UI ---
  const [isStreaming, setIsStreaming] = useState(false);
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const [deviceType, setDeviceType] = useState<'local' | 'remote'>('local');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- Estado de detecciones ---
  const [realtimeDetections, setRealtimeDetections] = useState<RealtimeDetection[]>([]);
  const [finalDetections, setFinalDetections] = useState<FinalDetection[]>([]);
  const [numPeople, setNumPeople] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // --- Referencias para Renderizado y Lógica ---
  // Referencia al elemento canvas para mostrar el resultado
  const imgRef = useRef<HTMLCanvasElement>(null);
  
  // Elementos ocultos para captura local (WebSockets)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Conexiones
  const eventSourceRef = useRef<EventSource | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Timers
  const frameIntervalRef = useRef<number | null>(null);
  const seenBehaviorsRef = useRef<Set<string>>(new Set());

  // =======================================================================
  // INICIAR STREAM REMOTO (SSE)
  // =======================================================================
  const startRemoteStream = useCallback(() => {
    try {
      const source = new EventSource(`${API_BASE}/api/analysis/live/stream/?source=remote&url=${encodeURIComponent(remoteUrl)}&fps_skip=${framesSkip}&mode=${poseMode}`);
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
                { behavior, label: BEHAVIOR_LABELS[behavior] || behavior }
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
  }, [framesSkip, poseMode, remoteUrl]);

  // =======================================================================
  // INICIAR STREAM LOCAL (WebSockets + getUserMedia)
  // =======================================================================
  const startLocalStream = useCallback(async () => {
    try {
      // 1. Pedir permisos y abrir la cámara web local
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 2. Conectar al WebSocket
      const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws/live-detection/';
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        setIsStreaming(true);
        
        // Función para enviar un fotograma
        const sendFrame = () => {
          if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (video.videoWidth > 0 && video.videoHeight > 0 && ctx) {
              // Limitar el ancho máximo para mejorar la velocidad y reducir el lag (Ej: 640px)
              const MAX_WIDTH = 640;
              const scale = Math.min(MAX_WIDTH / video.videoWidth, 1);
              
              canvas.width = video.videoWidth * scale;
              canvas.height = video.videoHeight * scale;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Reducir calidad para mejorar fluidez
              const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
              
              ws.send(JSON.stringify({
                frame: base64Data,
                fps_skip: framesSkip,
                mode: poseMode
              }));
            } else {
              // Si el video aún no carga, intentar de nuevo en 50ms
              frameIntervalRef.current = window.setTimeout(sendFrame, 50);
            }
          }
        };

        // Enviar el primer frame inmediatamente
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
               if (data.detections && Array.isArray(data.detections)) {
                 data.detections.forEach((behavior: string) => {
                   if (!seenBehaviorsRef.current.has(behavior)) {
                     seenBehaviorsRef.current.add(behavior);
                     setRealtimeDetections(prev => [
                       ...prev,
                       { behavior, label: BEHAVIOR_LABELS[behavior] || behavior }
                     ]);
                   }
                 });
               }

               // Enviar el SIGUIENTE frame inmediatamente después de procesar el anterior
               // Esto maximiza la fluidez eliminando el retraso artificial
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
  }, [framesSkip, poseMode]);

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
    // 1. Limpiar SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // 2. Limpiar WebSockets y cámara local
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
      setIsFinished(true); // Al detener manualmente, marcamos como terminado para ver resultados
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