import React from 'react';
import { POSE_CONNECTIONS } from '../utils/ai-visuals';

interface Keypoint {
  id?: number;
  name?: string;
  x: number;
  y: number;
  z?: number;
  confidence?: number;
}

interface SkeletonSvgOverlayProps {
  keypoints: Keypoint[];
  naturalSize: { w: number; h: number };
  selectedKp?: number | null;
  onKpClick?: (id: number) => void;
  onKpMouseDown?: (id: number, e: React.MouseEvent) => void;
  getRealCoords?: (x: number, y: number) => { x: number; y: number };
}

const defaultGetRealCoords = (x: number, y: number) => ({ x, y });

export const SkeletonSvgOverlay = React.forwardRef<SVGSVGElement, SkeletonSvgOverlayProps>(({
  keypoints,
  naturalSize,
  selectedKp = null,
  onKpClick,
  onKpMouseDown,
  getRealCoords = defaultGetRealCoords
}, ref) => {
  if (naturalSize.w === 0 || keypoints.length === 0) return null;

  return (
    <svg ref={ref} viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`} className="absolute inset-0 w-full h-full pointer-events-none">
      {/* LÍNEAS DE COLORES */}
      {POSE_CONNECTIONS.map((connection, idx) => {
        const kp1 = keypoints.find(k => k.id === connection.pair[0]);
        const kp2 = keypoints.find(k => k.id === connection.pair[1]);
        
        if (kp1 && kp2) {
          const p1 = getRealCoords(kp1.x, kp1.y);
          const p2 = getRealCoords(kp2.x, kp2.y);
          return (
            <line 
              key={`bone-${idx}`} 
              x1={p1.x} 
              y1={p1.y} 
              x2={p2.x} 
              y2={p2.y} 
              stroke={connection.color} 
              strokeWidth={Math.max(naturalSize.w / 600, 1)} 
              strokeOpacity="0.85" 
            />
          );
        }
        return null;
      })}
      
      {/* PUNTOS REDUCIDOS DE TAMAÑO */}
      {keypoints.map(kp => {
        if (kp.id === undefined) return null;
        const p = getRealCoords(kp.x, kp.y);
        return (
          <circle 
            key={`joint-${kp.id}`} 
            cx={p.x} 
            cy={p.y} 
            r={Math.max(naturalSize.w / 1000, 1.5)} 
            fill={selectedKp === kp.id ? "#ef4444" : "#0ea5e9"} 
            stroke="#ffffff" 
            strokeWidth={Math.max(naturalSize.w / 1000, 1)} 
            className={`transition-colors pointer-events-auto ${(onKpClick || onKpMouseDown) ? 'cursor-pointer hover:fill-yellow-400' : ''}`}
            onClick={(e) => {
              if (onKpClick) {
                e.stopPropagation();
                onKpClick(kp.id!);
              }
            }}
            onMouseDown={(e) => {
              if (onKpMouseDown) {
                e.stopPropagation();
                onKpMouseDown(kp.id!, e);
              }
            }}
          />
        );
      })}
      
      {/* RADAR (Solo si hay un punto seleccionado) */}
      {selectedKp !== null && keypoints.filter(k => k.id === selectedKp).map(kp => {
        const p = getRealCoords(kp.x, kp.y);
        return (
          <circle 
            key={`radar-${kp.id}`} 
            cx={p.x} 
            cy={p.y} 
            r={Math.max(naturalSize.w / 40, 15)} 
            className="animate-ping origin-center pointer-events-none" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth={Math.max(naturalSize.w / 300, 2)} 
          />
        );
      })}
    </svg>
  );
});
