export interface CreateSupplyRequest {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateSupplyResponse {
  id: number;
  name: string;
  quantity: number;
  price: number;
}
