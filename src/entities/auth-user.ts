import { Entity } from './entity';
import { ValidationError } from '../usecases/errors/errors';
import bcrypt from 'bcrypt';

export enum UserRole {
    ADMIN = 'admin',
    MECHANIC = 'mechanic'
}

export interface UserProps {
    name: string;
    password: string;
    role: UserRole;
}

export class User extends Entity<number> {

    get name(): string {
        return this.props.name;
    }

    get password(): string {
        return this.props.password;
    }

    get role(): UserRole {
        return this.props.role;
    }

    private readonly props: UserProps;

    constructor(props: UserProps, id?: number) {
        super(id);
        this.validate(props);
        this.props = props;
    }

    public async hashPassword(): Promise<void> {
        const saltRounds = 10;
        this.props.password = await bcrypt.hash(this.props.password, saltRounds);
    }

    public async verifyPassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.props.password);
    }

    public toJSON() {
        return {
            id: this._id,
            name: this.props.name,
            role: this.props.role
            // Note: password is intentionally excluded from JSON output for security
        };
    }

    public toDatabase() {
        return {
            name: this.props.name,
            password: this.props.password,
            role: this.props.role
        };
    }

    private validate(props: UserProps): void {
        if (!props.name || props.name.trim().length === 0) {
            throw new ValidationError('Nome do usuário é obrigatório');
        }

        if (!Object.values(UserRole).includes(props.role)) {
            throw new ValidationError('Função do usuário inválida');
        }

        if (!props.password || props.password.length < 6) {
            throw new ValidationError('Senha deve ter pelo menos 6 caracteres');
        }
    }
}