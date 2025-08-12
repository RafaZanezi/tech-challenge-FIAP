import { CreateServiceUseCase } from './create-service.use-case';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';

describe('CreateServiceUseCase', () => {
    let useCase: CreateServiceUseCase;
    let mockServiceRepository: jest.Mocked<ServiceRepository>;

    beforeEach(() => {
        mockServiceRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        useCase = new CreateServiceUseCase(mockServiceRepository);
    });

    it('should create service successfully', async () => {
        const serviceData = {
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        };

        const savedService = new Service(serviceData, 1);

        mockServiceRepository.findByName.mockResolvedValue(null);
        mockServiceRepository.save.mockResolvedValue(savedService);

        const result = await useCase.execute(serviceData);

        expect(mockServiceRepository.findByName).toHaveBeenCalledWith('Oil Change');
        expect(mockServiceRepository.save).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        });
    });

    it('should throw ConflictError when service with same name exists', async () => {
        const serviceData = {
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        };

        const existingService = new Service(serviceData, 1);
        mockServiceRepository.findByName.mockResolvedValue(existingService);

        await expect(useCase.execute(serviceData)).rejects.toThrow(
            new ConflictError('Serviço com este nome já existe')
        );

        expect(mockServiceRepository.findByName).toHaveBeenCalledWith('Oil Change');
        expect(mockServiceRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
        const serviceData = {
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        };

        mockServiceRepository.findByName.mockResolvedValue(null);
        mockServiceRepository.save.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(serviceData)).rejects.toThrow('Database error');

        expect(mockServiceRepository.findByName).toHaveBeenCalledWith('Oil Change');
        expect(mockServiceRepository.save).toHaveBeenCalled();
    });
});
