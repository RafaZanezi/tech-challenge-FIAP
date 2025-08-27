export interface UpdateVehicleRequest {
  id: number;
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  clientId?: number;
}

export interface UpdateVehicleResponse {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: number;
}
