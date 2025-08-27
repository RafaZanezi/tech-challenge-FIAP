import { CreateVehicleUseCase } from './create-vehicle.use-case';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { ClientRepository } from '../../../client/domain/client-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { Client } from '../../../client/domain/client.entity';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('CreateVehicleUseCase', () => {
    let useCase: CreateVehicleUseCase;
    let mockVehicleRepository: jest.Mocked<VehicleRepository>;
    let mockClientRepository: jest.Mocked<ClientRepository>;

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

        mockClientRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByIdentifier: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        useCase = new CreateVehicleUseCase(mockVehicleRepository, mockClientRepository);
    });

    it('should create vehicle successfully', async () => {
        const vehicleData = {
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 1,
        };

        const mockClient = new Client({ name: 'John Doe', identifier: '11144477735' }, 1);
        const savedVehicle = new Vehicle(vehicleData, 1);

        mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
        mockClientRepository.findById.mockResolvedValue(mockClient);
        mockVehicleRepository.save.mockResolvedValue(savedVehicle);

        const result = await useCase.execute(vehicleData);

        expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith('ABC-1234');
        expect(mockClientRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.save).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 1,
        });
    });

    it('should throw ConflictError when vehicle with same license plate exists', async () => {
        const vehicleData = {
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 1,
        };

        const existingVehicle = new Vehicle(vehicleData, 1);
        mockVehicleRepository.findByLicensePlate.mockResolvedValue(existingVehicle);

        await expect(useCase.execute(vehicleData)).rejects.toThrow(
            new ConflictError('Veículo com esta placa já existe')
        );

        expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith('ABC-1234');
        expect(mockClientRepository.findById).not.toHaveBeenCalled();
        expect(mockVehicleRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when client does not exist', async () => {
        const vehicleData = {
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 999,
        };

        mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
        mockClientRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(vehicleData)).rejects.toThrow(
            new NotFoundError('Client', '999')
        );

        expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith('ABC-1234');
        expect(mockClientRepository.findById).toHaveBeenCalledWith(999);
        expect(mockVehicleRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
        const vehicleData = {
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 1,
        };

        const mockClient = new Client({ name: 'John Doe', identifier: '11144477735' }, 1);

        mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
        mockClientRepository.findById.mockResolvedValue(mockClient);
        mockVehicleRepository.save.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(vehicleData)).rejects.toThrow('Database error');

        expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith('ABC-1234');
        expect(mockClientRepository.findById).toHaveBeenCalledWith(1);
        expect(mockVehicleRepository.save).toHaveBeenCalled();
    });
});
