import { UpdateVehicleUseCase } from './update-vehicle.use-case';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('UpdateVehicleUseCase', () => {
    let useCase: UpdateVehicleUseCase;
    let mockVehicleRepository: jest.Mocked<VehicleRepository>;

    beforeEach(() => {
        mockVehicleRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByLicensePlate: jest.fn(),
            findByClientId: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        useCase = new UpdateVehicleUseCase(mockVehicleRepository);
    });

    it('should update vehicle successfully', async () => {
        const existingVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        const updateData = {
            id: 1,
            brand: 'Honda',
            model: 'Civic',
            year: 2022,
            licensePlate: 'XYZ-9876',
            clientId: 2,
        };

        mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
        mockVehicleRepository.update.mockResolvedValue(existingVehicle);

        const result = await useCase.execute(updateData);

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.update).toHaveBeenCalledWith(1, expect.any(Vehicle));
        expect(result).toEqual({
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        });
    });

    it('should throw NotFoundError when vehicle does not exist', async () => {
        const updateData = {
            id: 999,
            brand: 'Honda',
        };

        mockVehicleRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(updateData)).rejects.toThrow(
            new NotFoundError('Vehicle', '999')
        );

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(999);
        expect(mockVehicleRepository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
        const existingVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        const updateData = {
            id: 1,
            brand: 'Honda',
        };

        mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
        mockVehicleRepository.update.mockResolvedValue(existingVehicle);

        await useCase.execute(updateData);

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.update).toHaveBeenCalledWith(1, expect.any(Vehicle));
    });

    it('should handle repository errors during update', async () => {
        const existingVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        const updateData = {
            id: 1,
            brand: 'Honda',
        };

        mockVehicleRepository.findById.mockResolvedValue(existingVehicle);
        mockVehicleRepository.update.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(updateData)).rejects.toThrow('Database error');

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.update).toHaveBeenCalledWith(1, expect.any(Vehicle));
    });
});
