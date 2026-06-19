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