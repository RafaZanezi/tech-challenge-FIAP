import { DeleteServiceUseCase } from './delete-service.use-case';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('DeleteServiceUseCase', () => {
    let useCase: DeleteServiceUseCase;
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

        useCase = new DeleteServiceUseCase(mockServiceRepository);
    });

    it('should delete service successfully', async () => {
        const mockService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        mockServiceRepository.findById.mockResolvedValue(mockService);
        mockServiceRepository.delete.mockResolvedValue(undefined);

        await useCase.execute(1);

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when service does not exist', async () => {
        mockServiceRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(999)).rejects.toThrow(
            new NotFoundError('Service', '999')
        );

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(999);
        expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
        const mockService = new Service({
            name: 'Oil Change',
            description: 'Engine oil change service',
            price: 50.00,
        }, 1);

        mockServiceRepository.findById.mockResolvedValue(mockService);
        mockServiceRepository.delete.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle repository errors during find', async () => {
        mockServiceRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
        expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });
});
