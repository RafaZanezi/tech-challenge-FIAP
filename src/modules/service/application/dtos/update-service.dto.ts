export interface UpdateServiceRequest {
  id: number;
  name?: string;
  description?: string;
  price?: number;
}

export interface UpdateServiceResponse {
  id: number;
  name: string;
  description: string;
  price: number;
}
