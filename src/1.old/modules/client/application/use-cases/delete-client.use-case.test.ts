import { DeleteClientUseCase } from './delete-client.use-case';
import { ClientRepository } from '../../domain/client-repository.interface';

describe('DeleteClientUseCase', () => {
    let useCase: DeleteClientUseCase;
    let mockClientRepository: jest.Mocked<ClientRepository>;

    beforeEach(() => {
        mockClientRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByIdentifier: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        useCase = new DeleteClientUseCase(mockClientRepository);
    });

    it('should delete client successfully', async () => {
        mockClientRepository.delete.mockResolvedValue(undefined);

        await useCase.execute({ id: 1 });

        expect(mockClientRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle repository error during deletion', async () => {
        const error = new Error('Database connection failed');
        mockClientRepository.delete.mockRejectedValue(error);

        await expect(useCase.execute({ id: 1 })).rejects.toThrow('Database connection failed');
        expect(mockClientRepository.delete).toHaveBeenCalledWith(1);
    });
});
