export interface User {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string | number; 
  isActive: boolean;
  
  // Nuevas propiedades opcionales para manejar los IDs en los selects
  idRol?: string | number;     
  idEmpresa?: string | number; 
}