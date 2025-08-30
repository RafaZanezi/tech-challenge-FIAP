import { Entity } from './entity';
import { UserRole } from '../interfaces/enums/user-role.enum';
import { ValidationError } from '../usecases/errors/errors';

export interface UserProps {
    id: number;
    name: string;
    role: UserRole;
}

export class User extends Entity<number> {

    get id(): number {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
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

    public toJSON() {
        return {
            id: this._id,
            name: this.props.name,
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
    }
}
