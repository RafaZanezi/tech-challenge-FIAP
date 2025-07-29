export interface UpdateClientRequest {
    id: number;
    name?: string;
    identifier?: string;
}

export interface UpdateClientResponse {
    id: number;
    name: string;
    identifier: string;
}
