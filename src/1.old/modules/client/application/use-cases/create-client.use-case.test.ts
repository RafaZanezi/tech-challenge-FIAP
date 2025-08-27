import { CreateClientUseCase } from './create-client.use-case';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../domain/client.entity';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';

describe('CreateClientUseCase', () => {
    let useCase: CreateClientUseCase;
    let mockClientRepository: jest.Mocked<ClientRepository>;

    beforeEach(() => {
        mockClientRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByIdentifier: jest.fn()
        };

        useCase = new CreateClientUseCase(mockClientRepository);
    });

    describe('execute', () => {
        it('should create client successfully when identifier does not exist', async () => {
            // Arrange
            const request = {
                name: 'João Silva',
                identifier: '11144477735'
            };

            const savedClient = new Client({
                name: request.name,
                identifier: request.identifier
            }, 1);

            mockClientRepository.findByIdentifier.mockResolvedValue(null);
            mockClientRepository.save.mockResolvedValue(savedClient);

            // Act
            const result = await useCase.execute(request);

            // Assert
            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.save).toHaveBeenCalledWith(expect.any(Client));
            expect(result).toEqual({
                id: 1,
                name: request.name,
                identifier: request.identifier
            });
        });

        it('should throw ConflictError when client with identifier already exists', async () => {
            // Arrange
            const request = {
                name: 'João Silva',
                identifier: '11144477735'
            };

            const existingClient = new Client({
                name: 'Existing Client',
                identifier: request.identifier
            }, 1);

            mockClientRepository.findByIdentifier.mockResolvedValue(existingClient);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow(ConflictError);
            await expect(useCase.execute(request)).rejects.toThrow('Cliente com este identificador já existe');

            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository errors', async () => {
            // Arrange
            const request = {
                name: 'João Silva',
                identifier: '11144477735'
            };

            const error = new Error('Database connection failed');
            mockClientRepository.findByIdentifier.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');
            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.save).not.toHaveBeenCalled();
        });

        it('should handle save errors correctly', async () => {
            // Arrange
            const request = {
                name: 'João Silva',
                identifier: '11144477735'
            };

            const saveError = new Error('Failed to save client');
            mockClientRepository.findByIdentifier.mockResolvedValue(null);
            mockClientRepository.save.mockRejectedValue(saveError);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow('Failed to save client');
            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.save).toHaveBeenCalledWith(expect.any(Client));
        });
    });
});
