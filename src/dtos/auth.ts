export interface LoginDTO {
    name: string;
    password: string;
}

export interface RegisterDTO {
    name: string;
    password: string;
    role: string;
}

export interface AuthResponseDTO {
    user: {
        id: number;
        name: string;
        role: string;
    };
    token: string;
}

export interface UserDTO {
    id: number;
    name: string;
    password: string;
    role: string;
}