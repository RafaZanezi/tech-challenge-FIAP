import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface ClientProps {
  name: string;
  identifier: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Client extends Entity<string> {

  get name(): string {
    return this.props.name;
  }

  get identifier(): string {
    return this.props.identifier;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  private readonly props: ClientProps;

  constructor(props: ClientProps, id?: string) {
    super(id);
    this.validate(props);
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date()
    };
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Client name cannot be empty');
    }
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public updateIdentifier(identifier: string): void {
    if (!this.isValidIdentifier(identifier)) {
      throw new ValidationError('Invalid client identifier');
    }
    this.props.identifier = identifier;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this._id,
      name: this.props.name,
      identifier: this.props.identifier,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  private validate(props: ClientProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Client name is required');
    }

    if (!props.identifier || props.identifier.trim().length === 0) {
      throw new ValidationError('Client identifier is required');
    }

    if (!this.isValidIdentifier(props.identifier)) {
      throw new ValidationError('Invalid client identifier format');
    }
  }

  private isValidIdentifier(identifier: string): boolean {
    // Validação básica de CPF/CNPJ (pode ser expandida)
    const cleaned = identifier.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  }
}
