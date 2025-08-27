export enum UserRole {
    ADMIN = 'admin',
    MECHANIC = 'mechanic'
}

export interface UserData {
    id?: number;
    name: string;
    password: string;
    role: UserRole;
}

export class User {
    public readonly id?: number;
    public readonly name: string;
    public readonly password: string;
    public readonly role: UserRole;

    constructor(data: UserData) {
        this.validate(data);
        this.id = data.id;
        this.name = data.name;
        this.password = data.password;
        this.role = data.role;
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            role: this.role
            // Note: password is intentionally excluded from JSON output for security
        };
    }

    private validate(data: UserData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Nome do usuário é obrigatório');
        }

        if (!Object.values(UserRole).includes(data.role)) {
            throw new Error('Função do usuário inválida');
        }

        if (!data.password || data.password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
    }

    public static fromDatabase(row: any): User {
        return new User({
            id: row.id,
            name: row.name,
            password: row.password,
            role: row.role as UserRole
        });
    }
}
