export interface LoginUserRequest {
    name: string;
    password: string;
}

export interface LoginUserResponse {
    id: number;
    name: string;
    role: string;
    token: string;
}
