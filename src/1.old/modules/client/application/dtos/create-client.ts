export interface CreateClientRequest {
  name: string;
  identifier: string;
}

export interface CreateClientResponse {
  id: number;
  name: string;
  identifier: string;
}
