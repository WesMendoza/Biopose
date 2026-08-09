export interface AnalysisResponse {
  status: string;
  detalle?: {
    id?: string;
    video_id?: string;
    message?: string;
  };
  data?: any;
}