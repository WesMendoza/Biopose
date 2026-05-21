import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../config'; 

// Transformar http://localhost:8000 a ws://localhost:8000
const WS_BASE = API_BASE.replace(/^http/, 'ws');

export const useLiveDetection = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [framesSkip, setFramesSkip] = useState(3);
  const [poseMode, setPoseMode] = useState<'2D' | '3D'>('2D');
  const [error, setError] = useState<string | null>(null);

  // Referencias a los elementos HTML y la conexión
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  
  // Función para dibujar los puntos devueltos por YOLO
  const drawKeypoints = useCallback((keypoints: any[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Asegurar que el canvas tenga el mismo tamaño que el video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar frame anterior

    // Dibujar los puntos (keypoints)
    keypoints.forEach((kp: any) => {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });

    // NOTA: Aquí puedes agregar lógica para dibujar las líneas del esqueleto si tu backend te devuelve las conexiones
  }, []);

  const startStream = async () => {
    setError(null);
    try {
      // 1. Encender la cámara web
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;

      // 2. Conectar al WebSocket del backend
      // (Asegúrate de configurar esta ruta en Django Channels)
      const wsUrl = `${WS_BASE}/ws/live-detection/`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsStreaming(true);
        console.log("WebSocket Conectado!");

        // 3. Empezar a capturar fotogramas y enviarlos
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Extraemos un frame cada 100ms (Ajustable según el server)
        frameIntervalRef.current = setInterval(() => {
          if (videoRef.current && ws.readyState === WebSocket.OPEN) {
            tempCanvas.width = videoRef.current.videoWidth;
            tempCanvas.height = videoRef.current.videoHeight;
            tempCtx?.drawImage(videoRef.current, 0, 0);
            
            // Convertimos la imagen a base64
            const frameBase64 = tempCanvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            
            // Enviamos el payload a Django
            ws.send(JSON.stringify({
              frame: frameBase64,
              fps_skip: framesSkip,
              mode: poseMode
            }));
          }
        }, 100); 
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Supongamos que Django nos devuelve un arreglo de 'keypoints'
        if (data.keypoints) {
          drawKeypoints(data.keypoints);
        }
      };

      ws.onerror = () => {
        setError("Error de conexión con el WebSocket de Django.");
        stopStream();
      };

    } catch (err) {
      setError("No se pudo acceder a la cámara o conectar al servidor.");
      console.error(err);
    }
  };

  const stopStream = () => {
    // Apagar cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Cerrar WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Detener intervalo de fotogramas
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleStream = () => {
    if (isStreaming) {
      stopStream();
    } else {
      startStream();
    }
  };

  return {
    isStreaming,
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    error,
    videoRef,   // <-- Necesitarás poner esto en tu <video ref={videoRef}> en la pantalla
    canvasRef,  // <-- Necesitarás poner esto en tu <canvas ref={canvasRef}> sobre el video
    toggleStream
  };
};