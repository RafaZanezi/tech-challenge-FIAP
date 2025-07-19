export interface CreateClientRequest {
  name: string;
  identifier: string;
}

export interface CreateClientResponse {
  id: string;
  name: string;
  identifier: string;
  createdAt: Date;
}
