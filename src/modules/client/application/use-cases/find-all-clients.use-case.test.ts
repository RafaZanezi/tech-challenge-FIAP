import { FindAllClientsUseCase } from './find-all-clients.use-case';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../domain/client.entity';

describe('FindAllClientsUseCase', () => {
    let useCase: FindAllClientsUseCase;
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

        useCase = new FindAllClientsUseCase(mockClientRepository);
    });

    it('should return all clients with mapped data', async () => {
        const mockClients = [
            new Client({ name: 'John Doe', identifier: '11144477735' }, 1),
            new Client({ name: 'Jane Smith', identifier: '52998224725' }, 2),
        ];

        mockClientRepository.findAll.mockResolvedValue(mockClients);

        const result = await useCase.execute();

        expect(mockClientRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual([
            {
                id: 1,
                name: 'John Doe',
                identifier: '11144477735',
            },
            {
                id: 2,
                name: 'Jane Smith',
                identifier: '52998224725',
            },
        ]);
    });

    it('should return empty array when no clients exist', async () => {
        mockClientRepository.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(mockClientRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });
});
