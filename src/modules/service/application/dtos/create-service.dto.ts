export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
}

export interface CreateServiceResponse {
  id: number;
  name: string;
  description: string;
  price: number;
}
