import { Entity } from './entity';
import { ValidationError } from '../usecases/errors/errors';

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

    public updateBrand(brand: string): void {
        if (!brand || brand.trim().length === 0) {
            throw new ValidationError('Marca do veículo não pode estar vazia');
        }

        this.props.brand = brand;
    }

    public updateModel(model: string): void {
        if (!model || model.trim().length === 0) {
            throw new ValidationError('Modelo do veículo não pode estar vazio');
        }

        this.props.model = model;
    }

    public updateYear(year: number): void {
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 1) {
            throw new ValidationError('Ano do veículo inválido');
        }

        this.props.year = year;
    }

    public updateLicensePlate(licensePlate: string): void {
        if (!this.isValidLicensePlate(licensePlate)) {
            throw new ValidationError('Placa do veículo inválida');
        }

        this.props.licensePlate = licensePlate;
    }

    public updateClientId(clientId: number): void {
        if (!clientId || clientId <= 0) {
            throw new ValidationError('ID do cliente inválido');
        }

        this.props.clientId = clientId;
    }

    public toJSON() {
        return {
            id: this._id,
            brand: this.props.brand,
            model: this.props.model,
            year: this.props.year,
            licensePlate: this.props.licensePlate,
            clientId: this.props.clientId
        };
    }

    private validate(props: VehicleProps): void {
        if (!props.brand || props.brand.trim().length === 0) {
            throw new ValidationError('Marca do veículo é obrigatória');
        }

        if (!props.model || props.model.trim().length === 0) {
            throw new ValidationError('Modelo do veículo é obrigatório');
        }

        const currentYear = new Date().getFullYear();
        if (!props.year || props.year < 1900 || props.year > currentYear + 1) {
            throw new ValidationError('Ano do veículo inválido');
        }

        if (!props.licensePlate || !this.isValidLicensePlate(props.licensePlate)) {
            throw new ValidationError('Placa do veículo é obrigatória e deve estar em formato válido');
        }

        if (!props.clientId || props.clientId <= 0) {
            throw new ValidationError('ID do cliente é obrigatório');
        }
    }

    private isValidLicensePlate(licensePlate: string): boolean {
        // Validação para placas brasileiras (formato antigo: AAA-9999 ou novo: AAA9A99)
        const cleaned = licensePlate.replace(/[-\s]/g, '').toUpperCase();
        
        // Formato antigo: 3 letras + 4 números
        const oldFormat = /^[A-Z]{3}\d{4}$/;
        
        // Formato Mercosul: 3 letras + 1 número + 1 letra + 2 números
        const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
        
        return oldFormat.test(cleaned) || newFormat.test(cleaned);
    }
}
