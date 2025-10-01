import { Vehicle } from './vehicle';
import { ValidationError } from '../usecases/errors/errors';

describe('Vehicle Entity', () => {
  const validVehicleData = {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC1234',
    clientId: 1
  };

  describe('constructor', () => {
    it('should create a vehicle with valid data', () => {
      const vehicle = new Vehicle(validVehicleData, 1);

      expect(vehicle.id).toBe(1);
      expect(vehicle.brand).toBe('Toyota');
      expect(vehicle.model).toBe('Corolla');
      expect(vehicle.year).toBe(2020);
      expect(vehicle.licensePlate).toBe('ABC1234');
      expect(vehicle.clientId).toBe(1);
    });

    it('should create a vehicle without id', () => {
      const vehicle = new Vehicle(validVehicleData);

      expect(vehicle.id).toBeUndefined();
      expect(vehicle.brand).toBe('Toyota');
    });

    it('should accept Mercosul format license plate', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'ABC1A23'
      };

      const vehicle = new Vehicle(vehicleData);
      expect(vehicle.licensePlate).toBe('ABC1A23');
    });

    it('should throw error for empty brand', () => {
      const vehicleData = {
        ...validVehicleData,
        brand: ''
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Marca do veículo é obrigatória');
    });

    it('should throw error for missing brand', () => {
      const vehicleData = {
        ...validVehicleData,
        brand: null as any
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Marca do veículo é obrigatória');
    });

    it('should throw error for empty model', () => {
      const vehicleData = {
        ...validVehicleData,
        model: ''
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Modelo do veículo é obrigatório');
    });

    it('should throw error for invalid year (too old)', () => {
      const vehicleData = {
        ...validVehicleData,
        year: 1899
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Ano do veículo inválido');
    });

    it('should throw error for invalid year (future)', () => {
      const currentYear = new Date().getFullYear();
      const vehicleData = {
        ...validVehicleData,
        year: currentYear + 2
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Ano do veículo inválido');
    });

    it('should accept current year + 1', () => {
      const currentYear = new Date().getFullYear();
      const vehicleData = {
        ...validVehicleData,
        year: currentYear + 1
      };

      expect(() => new Vehicle(vehicleData)).not.toThrow();
    });

    it('should throw error for invalid license plate format', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'INVALID'
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Placa do veículo é obrigatória e deve estar em formato válido');
    });

    it('should throw error for empty license plate', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: ''
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('Placa do veículo é obrigatória e deve estar em formato válido');
    });

    it('should throw error for invalid client id (zero)', () => {
      const vehicleData = {
        ...validVehicleData,
        clientId: 0
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('ID do cliente é obrigatório');
    });

    it('should throw error for invalid client id (negative)', () => {
      const vehicleData = {
        ...validVehicleData,
        clientId: -1
      };

      expect(() => new Vehicle(vehicleData)).toThrow(ValidationError);
      expect(() => new Vehicle(vehicleData)).toThrow('ID do cliente é obrigatório');
    });
  });

  describe('updateBrand', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle(validVehicleData);
    });

    it('should update brand with valid value', () => {
      vehicle.updateBrand('Honda');
      expect(vehicle.brand).toBe('Honda');
    });

    it('should throw error for empty brand', () => {
      expect(() => vehicle.updateBrand('')).toThrow(ValidationError);
      expect(() => vehicle.updateBrand('')).toThrow('Marca do veículo não pode estar vazia');
    });

    it('should throw error for whitespace-only brand', () => {
      expect(() => vehicle.updateBrand('   ')).toThrow(ValidationError);
      expect(() => vehicle.updateBrand('   ')).toThrow('Marca do veículo não pode estar vazia');
    });
  });

  describe('updateModel', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle(validVehicleData);
    });

    it('should update model with valid value', () => {
      vehicle.updateModel('Civic');
      expect(vehicle.model).toBe('Civic');
    });

    it('should throw error for empty model', () => {
      expect(() => vehicle.updateModel('')).toThrow(ValidationError);
      expect(() => vehicle.updateModel('')).toThrow('Modelo do veículo não pode estar vazio');
    });
  });

  describe('updateYear', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle(validVehicleData);
    });

    it('should update year with valid value', () => {
      vehicle.updateYear(2022);
      expect(vehicle.year).toBe(2022);
    });

    it('should throw error for year too old', () => {
      expect(() => vehicle.updateYear(1899)).toThrow(ValidationError);
      expect(() => vehicle.updateYear(1899)).toThrow('Ano do veículo inválido');
    });

    it('should throw error for year too far in future', () => {
      const currentYear = new Date().getFullYear();
      expect(() => vehicle.updateYear(currentYear + 2)).toThrow(ValidationError);
      expect(() => vehicle.updateYear(currentYear + 2)).toThrow('Ano do veículo inválido');
    });
  });

  describe('updateLicensePlate', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle(validVehicleData);
    });

    it('should update license plate with valid old format', () => {
      vehicle.updateLicensePlate('XYZ9876');
      expect(vehicle.licensePlate).toBe('XYZ9876');
    });

    it('should update license plate with valid Mercosul format', () => {
      vehicle.updateLicensePlate('XYZ1A23');
      expect(vehicle.licensePlate).toBe('XYZ1A23');
    });

    it('should throw error for invalid license plate', () => {
      expect(() => vehicle.updateLicensePlate('INVALID')).toThrow(ValidationError);
      expect(() => vehicle.updateLicensePlate('INVALID')).toThrow('Placa do veículo inválida');
    });
  });

  describe('updateClientId', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle(validVehicleData);
    });

    it('should update client id with valid value', () => {
      vehicle.updateClientId(2);
      expect(vehicle.clientId).toBe(2);
    });

    it('should throw error for zero client id', () => {
      expect(() => vehicle.updateClientId(0)).toThrow(ValidationError);
      expect(() => vehicle.updateClientId(0)).toThrow('ID do cliente inválido');
    });

    it('should throw error for negative client id', () => {
      expect(() => vehicle.updateClientId(-1)).toThrow(ValidationError);
      expect(() => vehicle.updateClientId(-1)).toThrow('ID do cliente inválido');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation with id', () => {
      const vehicleData = {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      };
      const vehicle = new Vehicle(vehicleData, 1);

      const json = vehicle.toJSON();

      expect(json).toEqual({
        id: 1,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      });
    });

    it('should return correct JSON representation without id', () => {
      const vehicleData = {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      };
      const vehicle = new Vehicle(vehicleData);

      const json = vehicle.toJSON();

      expect(json).toEqual({
        id: undefined,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      });
    });
  });

  describe('license plate validation', () => {
    it('should accept old format with hyphens', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'ABC-1234'
      };

      expect(() => new Vehicle(vehicleData)).not.toThrow();
    });

    it('should accept Mercosul format with hyphens', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'ABC-1A23'
      };

      expect(() => new Vehicle(vehicleData)).not.toThrow();
    });

    it('should accept license plates with spaces', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'ABC 1234'
      };

      expect(() => new Vehicle(vehicleData)).not.toThrow();
    });

    it('should accept lowercase letters', () => {
      const vehicleData = {
        ...validVehicleData,
        licensePlate: 'abc1234'
      };

      expect(() => new Vehicle(vehicleData)).not.toThrow();
    });
  });
});