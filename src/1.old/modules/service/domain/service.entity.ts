import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface ServiceProps {
  name: string;
  description: string;
  price: number;
}

export class Service extends Entity<number> {

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  private readonly props: ServiceProps;

  constructor(props: ServiceProps, id?: number) {
    super(id);
    this.validate(props);
    this.props = props;
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Nome do serviço não pode estar vazio');
    }

    this.props.name = name;
  }

  public updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Descrição do serviço não pode estar vazia');
    }

    this.props.description = description;
  }

  public updatePrice(price: number): void {
    if (price <= 0) {
      throw new ValidationError('Preço do serviço deve ser maior que zero');
    }

    this.props.price = price;
  }

  public toJSON() {
    return {
      id: this._id,
      name: this.props.name,
      description: this.props.description,
      price: this.props.price,
    };
  }

  private validate(props: ServiceProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Nome do serviço é obrigatório');
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new ValidationError('Descrição do serviço é obrigatória');
    }

    if (!props.price || props.price <= 0) {
      throw new ValidationError('Preço do serviço deve ser maior que zero');
    }
  }
}
