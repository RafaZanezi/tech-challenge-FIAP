import { FindVehicleUseCase } from './find-vehicle.use-case';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('FindVehicleUseCase', () => {
    let useCase: FindVehicleUseCase;
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

        useCase = new FindVehicleUseCase(mockVehicleRepository);
    });

    it('should return vehicle when found', async () => {
        const mockVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        mockVehicleRepository.findById.mockResolvedValue(mockVehicle);

        const result = await useCase.execute({ id: 1 });

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual({
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        });
    });

    it('should throw NotFoundError when vehicle not found', async () => {
        mockVehicleRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 })).rejects.toThrow(
            new NotFoundError('Vehicle', '999')
        );

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should handle repository errors', async () => {
        mockVehicleRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute({ id: 1 })).rejects.toThrow('Database error');

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
    });
});
