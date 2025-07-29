import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface ClientProps {
    name: string;
    identifier: string;
}

export class Client extends Entity<number> {

    get name(): string {
        return this.props.name;
    }

    get identifier(): string {
        return this.props.identifier;
    }

    private readonly props: ClientProps;

    constructor(props: ClientProps, id?: number) {
        super(id);
        this.validate(props);
        this.props = props;
    }

    public updateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Nome do cliente não pode estar vazio');
        }

        this.props.name = name;
    }

    public updateIdentifier(identifier: string): void {
        if (!this.isValidIdentifier(identifier)) {
            throw new ValidationError('Identificador do cliente inválido');
        }

        this.props.identifier = identifier;
    }

    public toJSON() {
        return {
            id: this._id,
            name: this.props.name,
            identifier: this.props.identifier
        };
    }

    private validate(props: ClientProps): void {
        if (!props.name || props.name.trim().length === 0) {
            throw new ValidationError('Nome do cliente é obrigatório');
        }

        if (!props.identifier || props.identifier.trim().length === 0) {
            throw new ValidationError('Identificador do cliente é obrigatório');
        }

        if (!this.isValidIdentifier(props.identifier)) {
            throw new ValidationError('Formato do identificador do cliente inválido');
        }
    }

    private isValidIdentifier(identifier: string): boolean {
        // Validação de CPF (apenas números, 11 dígitos, e dígitos verificadores corretos)
        const cleaned = identifier.replace(/\D/g, '');
        if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned.charAt(i)) * (10 - i);
        }
        let firstCheck = 11 - (sum % 11);
        if (firstCheck >= 10) { firstCheck = 0; }
        if (firstCheck !== parseInt(cleaned.charAt(9))) {
            return false;
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned.charAt(i)) * (11 - i);
        }
        let secondCheck = 11 - (sum % 11);
        if (secondCheck >= 10) { secondCheck = 0; }
        if (secondCheck !== parseInt(cleaned.charAt(10))) {
            return false;
        }

        return true;
    }
}
