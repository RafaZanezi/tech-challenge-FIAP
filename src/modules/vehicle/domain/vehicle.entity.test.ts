import { Vehicle } from './vehicle.entity';

describe('Vehicle Entity', () => {
    describe('constructor', () => {
        it('should create a valid vehicle', () => {
            // Arrange & Act
            const vehicle = new Vehicle({ 
                brand: 'Toyota', 
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            // Assert
            expect(vehicle.brand).toBe('Toyota');
            expect(vehicle.model).toBe('Corolla');
            expect(vehicle.year).toBe(2020);
            expect(vehicle.licensePlate).toBe('ABC-1234');
            expect(vehicle.clientId).toBe(1);
        });

        it('should create a vehicle with id', () => {
            // Arrange & Act
            const vehicle = new Vehicle({ 
                brand: 'Honda', 
                model: 'Civic',
                year: 2019,
                licensePlate: 'XYZ-5678',
                clientId: 2
            }, 123);

            // Assert
            expect(vehicle.id).toBe(123);
            expect(vehicle.brand).toBe('Honda');
        });

        it('should throw error for empty brand', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: '', model: 'Model', year: 2020, licensePlate: 'ABC-1234', clientId: 1 });
            }).toThrow('Marca do veículo é obrigatória');
        });

        it('should throw error for empty model', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: '', year: 2020, licensePlate: 'ABC-1234', clientId: 1 });
            }).toThrow('Modelo do veículo é obrigatório');
        });

        it('should throw error for invalid year - too old', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: 1899, licensePlate: 'ABC-1234', clientId: 1 });
            }).toThrow('Ano do veículo inválido');
        });

        it('should throw error for invalid year - too new', () => {
            // Arrange
            const nextYear = new Date().getFullYear() + 2;

            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: nextYear, licensePlate: 'ABC-1234', clientId: 1 });
            }).toThrow('Ano do veículo inválido');
        });

        it('should throw error for empty license plate', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: 2020, licensePlate: '', clientId: 1 });
            }).toThrow('Placa do veículo é obrigatória');
        });

        it('should throw error for invalid license plate format', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: 2020, licensePlate: '123ABCD', clientId: 1 });
            }).toThrow('Placa do veículo inválida');
        });

        it('should accept valid license plate without dash', () => {
            // Act
            const vehicle = new Vehicle({ 
                brand: 'Brand', 
                model: 'Model', 
                year: 2020, 
                licensePlate: 'ABC 1234', 
                clientId: 1 
            });

            // Assert
            expect(vehicle.licensePlate).toBe('ABC 1234');
        });

        it('should throw error for invalid client id', () => {
            // Act & Assert
            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: 2020, licensePlate: 'ABC-1234', clientId: 0 });
            }).toThrow('ID do cliente é obrigatório');

            expect(() => {
                new Vehicle({ brand: 'Brand', model: 'Model', year: 2020, licensePlate: 'ABC-1234', clientId: -1 });
            }).toThrow('ID do cliente é obrigatório');
        });

        it('should accept current year', () => {
            // Arrange
            const currentYear = new Date().getFullYear();

            // Act
            const vehicle = new Vehicle({ 
                brand: 'Brand', 
                model: 'Model', 
                year: currentYear, 
                licensePlate: 'ABC-1234', 
                clientId: 1 
            });

            // Assert
            expect(vehicle.year).toBe(currentYear);
        });

        it('should accept next year', () => {
            // Arrange
            const nextYear = new Date().getFullYear() + 1;

            // Act
            const vehicle = new Vehicle({ 
                brand: 'Brand', 
                model: 'Model', 
                year: nextYear, 
                licensePlate: 'ABC-1234', 
                clientId: 1 
            });

            // Assert
            expect(vehicle.year).toBe(nextYear);
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            // Arrange
            const vehicle = new Vehicle({ 
                brand: 'Test Brand', 
                model: 'Test Model',
                year: 2021,
                licensePlate: 'DEF-5678',
                clientId: 999
            }, 456);

            // Act
            const json = vehicle.toJSON();

            // Assert
            expect(json).toEqual({
                id: 456,
                brand: 'Test Brand',
                model: 'Test Model',
                year: 2021,
                licensePlate: 'DEF-5678'
            });
            // Note: clientId is not included in toJSON output based on the implementation
            expect(json).not.toHaveProperty('clientId');
        });
    });
});
