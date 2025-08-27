export interface CreateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: number;
}

export interface CreateVehicleResponse {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: number;
}
