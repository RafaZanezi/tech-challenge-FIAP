import { FindClientsUseCase } from './find-client.use-case';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../domain/client.entity';

describe('FindClientsUseCase', () => {
    let useCase: FindClientsUseCase;
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

        useCase = new FindClientsUseCase(mockClientRepository);
    });

    it('should return client when found', async () => {
        const mockClient = new Client({ name: 'John Doe', identifier: '11144477735' }, 1);
        
        mockClientRepository.findById.mockResolvedValue(mockClient);

        const result = await useCase.execute({ id: 1 });

        expect(mockClientRepository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual({
            id: 1,
            name: 'John Doe',
            identifier: '11144477735',
        });
    });

    it('should throw error when client not found', async () => {
        mockClientRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 })).rejects.toThrow('Cliente com id 999 não encontrado');
        expect(mockClientRepository.findById).toHaveBeenCalledWith(999);
    });
});
