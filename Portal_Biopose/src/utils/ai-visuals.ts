export const KEYPOINT_NAMES: Record<number, string> = {
  0: "Nariz", 1: "Ojo Izq", 2: "Ojo Der", 3: "Oreja Izq", 4: "Oreja Der",
  5: "Hombro Izq", 6: "Hombro Der", 7: "Codo Izq", 8: "Codo Der",
  9: "Muñeca Izq", 10: "Muñeca Der", 11: "Cadera Izq", 12: "Cadera Der",
  13: "Rodilla Izq", 14: "Rodilla Der", 15: "Tobillo Izq", 16: "Tobillo Der"
};

export const POSE_CONNECTIONS = [
  // Cabeza (Amarillo/Dorado)
  { pair: [0, 1], color: "#eab308" }, { pair: [0, 2], color: "#eab308" }, 
  { pair: [1, 3], color: "#eab308" }, { pair: [2, 4], color: "#eab308" },
  
  // Brazos
  { pair: [5, 7], color: "#f97316" },
  { pair: [7, 9], color: "#ef4444" },
  { pair: [6, 8], color: "#84cc16" },
  { pair: [8, 10], color: "#22c55e" },
  
  // Torso (Morado)
  { pair: [5, 6], color: "#8b5cf6" },
  { pair: [5, 11], color: "#8b5cf6" },
  { pair: [6, 12], color: "#8b5cf6" },
  { pair: [11, 12], color: "#8b5cf6" },
  
  // Piernas
  { pair: [11, 13], color: "#f43f5e" },
  { pair: [13, 15], color: "#e11d48" },
  { pair: [12, 14], color: "#06b6d4" },
  { pair: [14, 16], color: "#0ea5e9" }
];

export const getPersonColors = (personId: number, activeEvents: any[]) => {
  const personEvents = activeEvents.filter((e: any) => {
    const pids = e.detalles?.pids || (e.detalles?.pid !== undefined ? [e.detalles.pid] : []);
    return pids.length === 0 || pids.includes(personId);
  });

  const isPeleando = personEvents.some((e: any) => (e.tipo_evento || '').toLowerCase().includes('pelea'));
  const isDisturbio = personEvents.some((e: any) => (e.tipo_evento || '').toLowerCase().includes('disturbio') || (e.tipo_evento || '').toLowerCase().includes('altercado'));

  if (isPeleando) {
    return {
      boxColor: 'rgba(239, 68, 68, 1)',
      boxBgColor: 'rgba(239, 68, 68, 0.2)',
      skeletonColor: 'rgba(239, 68, 68, 0.8)',
      pointColor: 'rgba(255, 255, 255, 1)'
    };
  }
  
  if (isDisturbio) {
    return {
      boxColor: 'rgba(249, 115, 22, 1)',
      boxBgColor: 'rgba(249, 115, 22, 0.2)',
      skeletonColor: 'rgba(249, 115, 22, 0.8)',
      pointColor: 'rgba(255, 255, 255, 1)'
    };
  }

  return {
    boxColor: 'rgba(34, 197, 94, 1)',
    boxBgColor: 'transparent',
    skeletonColor: 'rgba(34, 197, 94, 0.8)',
    pointColor: 'rgba(34, 197, 94, 1)'
  };
};

export const drawPersonVisuals = (
  ctx: CanvasRenderingContext2D,
  personData: any,
  activeEvents: any[],
  scaleX: number,
  scaleY: number,
  videoWidth: number
) => {
  const personPoints = personData.keypoints_json || personData.keypoints;
  if (!Array.isArray(personPoints)) return;

  const { boxColor, boxBgColor, skeletonColor, pointColor } = getPersonColors(personData.person_id, activeEvents);

  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

  ctx.lineWidth = Math.max(videoWidth / 300, 2);

  // Draw Skeleton connections
  POSE_CONNECTIONS.forEach(({ pair }) => {
    const pt1 = personPoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === pair[0] || p.id === pair[0]);
    const pt2 = personPoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === pair[1] || p.id === pair[1]);
    
    const pt1Conf = pt1?.confidence ?? 1.0;
    const pt2Conf = pt2?.confidence ?? 1.0;

    if (pt1 && pt2 && pt1Conf > 0.4 && pt2Conf > 0.4) {
      ctx.strokeStyle = skeletonColor;
      ctx.beginPath();
      ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
      ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
      ctx.stroke();
    }
  });

  // Draw Keypoints & Calculate Bounding Box
  personPoints.forEach((point: any) => {
    const conf = point.confidence ?? 1.0;
    if (conf > 0.4) {
      const px = point.x * scaleX;
      const py = point.y * scaleY;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(videoWidth / 250, 3), 0, 2 * Math.PI);
      ctx.fillStyle = pointColor;
      ctx.fill();
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = Math.max(videoWidth / 500, 1);
      ctx.stroke();
    }
  });

  // Draw Bounding Box
  if (minX < Infinity && maxX > 0) {
    const padding = 20; 
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = boxBgColor;
    ctx.fillRect(minX - padding, minY - padding, (maxX - minX) + padding * 2, (maxY - minY) + padding * 2);
    ctx.strokeRect(minX - padding, minY - padding, (maxX - minX) + padding * 2, (maxY - minY) + padding * 2);
    
    // Draw Label/ID
    ctx.fillStyle = boxColor;
    ctx.font = '14px sans-serif';
    ctx.fillRect(minX - padding, minY - padding - 20, 60, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(`ID: ${personData.person_id}`, minX - padding + 5, minY - padding - 5);
  }
};

export const drawSkeletonVisuals = (
  ctx: CanvasRenderingContext2D,
  keypoints: any[],
  scaleX: number,
  scaleY: number,
  videoWidth: number,
  skeletonColor: string = 'rgba(16, 185, 129, 0.8)', // Verde por defecto
  pointColor: string = 'rgba(239, 68, 68, 1)' // Rojo por defecto
) => {
  if (!Array.isArray(keypoints)) return;

  ctx.lineWidth = Math.max(videoWidth / 300, 2);

  // Draw Skeleton connections
  POSE_CONNECTIONS.forEach(({ pair }) => {
    const pt1 = keypoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === pair[0] || p.id === pair[0]);
    const pt2 = keypoints.find((p: any) => (p.id !== undefined ? p.id : p.name) === pair[1] || p.id === pair[1]);
    
    const pt1Conf = pt1?.confidence ?? 1.0;
    const pt2Conf = pt2?.confidence ?? 1.0;

    if (pt1 && pt2 && pt1Conf > 0.4 && pt2Conf > 0.4) {
      ctx.strokeStyle = skeletonColor;
      ctx.beginPath();
      ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
      ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
      ctx.stroke();
    }
  });

  // Draw Keypoints
  keypoints.forEach((point: any) => {
    const conf = point.confidence ?? 1.0;
    if (conf > 0.4) {
      ctx.beginPath();
      ctx.arc(point.x * scaleX, point.y * scaleY, Math.max(videoWidth / 250, 3), 0, 2 * Math.PI);
      ctx.fillStyle = pointColor;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = Math.max(videoWidth / 500, 1);
      ctx.stroke();
    }
  });
};