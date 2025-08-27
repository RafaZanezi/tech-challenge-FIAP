import { DeleteVehicleUseCase } from './delete-vehicle.use-case';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('DeleteVehicleUseCase', () => {
    let useCase: DeleteVehicleUseCase;
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

        useCase = new DeleteVehicleUseCase(mockVehicleRepository);
    });

    it('should delete vehicle successfully', async () => {
        const mockVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
        mockVehicleRepository.delete.mockResolvedValue(undefined);

        await useCase.execute(1);

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when vehicle does not exist', async () => {
        mockVehicleRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(999)).rejects.toThrow(
            new NotFoundError('Vehicle', '999')
        );

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(999);
        expect(mockVehicleRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
        const mockVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            licensePlate: 'ABC-1234',
            clientId: 1,
        }, 1);

        mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
        mockVehicleRepository.delete.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle repository errors during find', async () => {
        mockVehicleRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockVehicleRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.delete).not.toHaveBeenCalled();
    });
});
