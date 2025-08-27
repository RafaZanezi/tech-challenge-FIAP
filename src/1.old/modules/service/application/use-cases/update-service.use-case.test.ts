import { UpdateServiceUseCase } from './update-service.use-case';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('UpdateServiceUseCase', () => {
    let useCase: UpdateServiceUseCase;
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

        useCase = new UpdateServiceUseCase(mockServiceRepository);
    });

    it('should update service successfully', async () => {
        const existingService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        const updateData = {
            id: 1,
            name: 'Premium Oil Change',
            description: 'Premium engine oil change service',
            price: 75.00,
        };

        mockServiceRepository.findById.mockResolvedValue(existingService);
        mockServiceRepository.update.mockResolvedValue(existingService);

        const result = await useCase.execute(updateData);

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.update).toHaveBeenCalledWith(1, existingService);
        expect(result).toEqual({
            id: 1,
            name: 'Premium Oil Change',
            description: 'Premium engine oil change service',
            price: 75.00,
        });
    });

    it('should throw NotFoundError when service does not exist', async () => {
        const updateData = {
            id: 999,
            name: 'Premium Oil Change',
        };

        mockServiceRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(updateData)).rejects.toThrow(
            new NotFoundError('Serviço', '999')
        );

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(999);
        expect(mockServiceRepository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
        const existingService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        const updateData = {
            id: 1,
            name: 'Premium Oil Change',
        };

        mockServiceRepository.findById.mockResolvedValue(existingService);
        mockServiceRepository.update.mockResolvedValue(existingService);

        await useCase.execute(updateData);

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.update).toHaveBeenCalledWith(1, existingService);
    });

    it('should handle repository errors during update', async () => {
        const existingService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        const updateData = {
            id: 1,
            name: 'Premium Oil Change',
        };

        mockServiceRepository.findById.mockResolvedValue(existingService);
        mockServiceRepository.update.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(updateData)).rejects.toThrow('Database error');

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.update).toHaveBeenCalledWith(1, existingService);
    });
});
