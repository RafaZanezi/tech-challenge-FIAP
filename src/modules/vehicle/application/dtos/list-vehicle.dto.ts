export interface FindVehicleRequest {
  id: number;
}

export interface FindVehicleResponse {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: number;
}
