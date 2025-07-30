import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface SupplyProps {
  name: string;
  quantity: number;
  price: number;
}

export class Supply extends Entity<number> {

  get name(): string {
    return this.props.name;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): number {
    return this.props.price;
  }

  private readonly props: SupplyProps;

  constructor(props: SupplyProps, id?: number) {
    super(id);
    this.validate(props);
    this.props = props;
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Nome do insumo não pode estar vazio');
    }

    this.props.name = name;
  }

  public updateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new ValidationError('Quantidade do insumo não pode ser negativa');
    }

    this.props.quantity = quantity;
  }

  public updatePrice(price: number): void {
    if (price < 0) {
      throw new ValidationError('Preço do insumo não pode ser negativo');
    }

    this.props.price = price;
  }

  public toJSON() {
    return {
      id: this._id,
      name: this.props.name,
      quantity: this.props.quantity,
      price: this.props.price,
    };
  }

  private validate(props: SupplyProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Nome do insumo é obrigatório');
    }

    if (props.quantity < 0) {
      throw new ValidationError('Quantidade do insumo não pode ser negativa');
    }

    if (props.price < 0) {
      throw new ValidationError('Preço do insumo não pode ser negativo');
    }
  }
}
