import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface VehicleProps {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle extends Entity<string> {

  get brand(): string {
    return this.props.brand;
  }

  get model(): string {
    return this.props.model;
  }

  get year(): number {
    return this.props.year;
  }

  get licensePlate(): string {
    return this.props.licensePlate;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  private readonly props: VehicleProps;

  constructor(props: VehicleProps, id?: string) {
    super(id);
    this.validate(props);
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date()
    };
  }

  public toJSON() {
    return {
      id: this._id,
      brand: this.props.brand,
      model: this.props.model,
      year: this.props.year,
      licensePlate: this.props.licensePlate,
      clientId: this.props.clientId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  private validate(props: VehicleProps): void {
    if (!props.brand || props.brand.trim().length === 0) {
      throw new ValidationError('Marca do veículo é obrigatória');
    }

    if (!props.model || props.model.trim().length === 0) {
      throw new ValidationError('Modelo do veículo é obrigatório');
    }

    if (!props.year || props.year < 1900 || props.year > new Date().getFullYear() + 1) {
      throw new ValidationError('Ano do veículo inválido');
    }

    if (!props.licensePlate || props.licensePlate.trim().length === 0) {
      throw new ValidationError('Placa do veículo é obrigatória');
    }

    if (!props.clientId || props.clientId.trim().length === 0) {
      throw new ValidationError('ID do cliente é obrigatório');
    }
  }
}
