export interface UpdateSupplyRequest {
  id: number;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface UpdateSupplyResponse {
  id: number;
  name: string;
  quantity: number;
  price: number;
}
