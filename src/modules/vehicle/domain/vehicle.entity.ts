import { Entity } from '../../../shared/domain/entities/entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

export interface VehicleProps {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  clientId: number;
}

export class Vehicle extends Entity<number> {

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

  get clientId(): number {
    return this.props.clientId;
  }

  private readonly props: VehicleProps;

  constructor(props: VehicleProps, id?: number) {
    super(id);
    this.validate(props);
    this.props = props;
  }

  public toJSON() {
    return {
      id: this._id,
      brand: this.props.brand,
      model: this.props.model,
      year: this.props.year,
      licensePlate: this.props.licensePlate,
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

    if (!this.validateLicensePlate(props.licensePlate)) {
      throw new ValidationError('Placa do veículo inválida');
    }

    if (!props.clientId || props.clientId <= 0) {
      throw new ValidationError('ID do cliente é obrigatório');
    }
  }

  private validateLicensePlate(plate: string): boolean {
    return RegExp(/^[A-Z]{3}[- ]?\d{4}$/).test(plate); // Format ABC-1234
  }
}
  