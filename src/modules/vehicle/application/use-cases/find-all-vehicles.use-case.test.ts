import { FindAllVehiclesUseCase } from './find-all-vehicles.use-case';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';

describe('FindAllVehiclesUseCase', () => {
    let findAllVehiclesUseCase: FindAllVehiclesUseCase;
    let mockVehicleRepository: jest.Mocked<VehicleRepository>;

    beforeEach(() => {
        mockVehicleRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByLicensePlate: jest.fn(),
            findByClientId: jest.fn()
        };

        findAllVehiclesUseCase = new FindAllVehiclesUseCase(mockVehicleRepository);
    });

    describe('execute', () => {
        it('should return all vehicles successfully', async () => {
            // Arrange
            const mockVehicles = [
                new Vehicle({ 
                    brand: 'Toyota', 
                    model: 'Corolla', 
                    year: 2020, 
                    licensePlate: 'ABC-1234',
                    clientId: 1
                }, 1),
                new Vehicle({ 
                    brand: 'Honda', 
                    model: 'Civic', 
                    year: 2019, 
                    licensePlate: 'XYZ-5678',
                    clientId: 2
                }, 2)
            ];

            mockVehicleRepository.findAll.mockResolvedValue(mockVehicles);

            // Act
            const result = await findAllVehiclesUseCase.execute();

            // Assert
            expect(mockVehicleRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
            expect(result[1]).toEqual({
                id: 2,
                brand: 'Honda',
                model: 'Civic',
                year: 2019,
                licensePlate: 'XYZ-5678',
                clientId: 2
            });
        });

        it('should return empty array when no vehicles exist', async () => {
            // Arrange
            mockVehicleRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await findAllVehiclesUseCase.execute();

            // Assert
            expect(mockVehicleRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });

        it('should handle repository errors', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            mockVehicleRepository.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(findAllVehiclesUseCase.execute()).rejects.toThrow('Database connection failed');
            expect(mockVehicleRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should map vehicle properties correctly', async () => {
            // Arrange
            const mockVehicle = new Vehicle({ 
                brand: 'Ford', 
                model: 'Focus', 
                year: 2021, 
                licensePlate: 'DEF-9876',
                clientId: 999
            }, 777);
            
            mockVehicleRepository.findAll.mockResolvedValue([mockVehicle]);

            // Act
            const result = await findAllVehiclesUseCase.execute();

            // Assert
            expect(result[0]).toEqual({
                id: 777,
                brand: 'Ford',
                model: 'Focus',
                year: 2021,
                licensePlate: 'DEF-9876',
                clientId: 999
            });
        });

        it('should handle vehicles from different clients', async () => {
            // Arrange
            const mockVehicles = [
                new Vehicle({ brand: 'BMW', model: 'X1', year: 2022, licensePlate: 'GHI-1111', clientId: 1 }, 1),
                new Vehicle({ brand: 'Audi', model: 'A3', year: 2020, licensePlate: 'JKL-2222', clientId: 1 }, 2),
                new Vehicle({ brand: 'Mercedes', model: 'C180', year: 2021, licensePlate: 'MNO-3333', clientId: 2 }, 3)
            ];

            mockVehicleRepository.findAll.mockResolvedValue(mockVehicles);

            // Act
            const result = await findAllVehiclesUseCase.execute();

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].clientId).toBe(1);
            expect(result[1].clientId).toBe(1);
            expect(result[2].clientId).toBe(2);
        });

        it('should handle vehicles with different years', async () => {
            // Arrange
            const currentYear = new Date().getFullYear();
            const mockVehicles = [
                new Vehicle({ brand: 'Fiat', model: 'Uno', year: 2000, licensePlate: 'OLD-1900', clientId: 1 }, 1),
                new Vehicle({ brand: 'Chevrolet', model: 'Onix', year: currentYear, licensePlate: 'NEW-2023', clientId: 2 }, 2)
            ];

            mockVehicleRepository.findAll.mockResolvedValue(mockVehicles);

            // Act
            const result = await findAllVehiclesUseCase.execute();

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].year).toBe(2000);
            expect(result[1].year).toBe(currentYear);
        });
    });
});
