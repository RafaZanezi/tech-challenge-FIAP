import { FindServiceUseCase } from './find-service.use-case';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('FindServiceUseCase', () => {
    let useCase: FindServiceUseCase;
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

        useCase = new FindServiceUseCase(mockServiceRepository);
    });

    it('should return service when found', async () => {
        const mockService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        mockServiceRepository.findById.mockResolvedValue(mockService);

        const result = await useCase.execute({ id: 1 });

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual({
            id: 1,
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        });
    });

    it('should throw NotFoundError when service not found', async () => {
        mockServiceRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 })).rejects.toThrow(
            new NotFoundError('Service', '999')
        );

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should handle repository errors', async () => {
        mockServiceRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute({ id: 1 })).rejects.toThrow('Database error');

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
    });
});
