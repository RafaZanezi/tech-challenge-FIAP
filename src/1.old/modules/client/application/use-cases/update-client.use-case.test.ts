import { UpdateClientUseCase } from './update-client.use-case';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../domain/client.entity';
import { ConflictHttpError } from '../../../../shared/domain/errors/http-errors';

describe('UpdateClientUseCase', () => {
    let useCase: UpdateClientUseCase;
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

        useCase = new UpdateClientUseCase(mockClientRepository);
    });

    describe('execute', () => {
        it('should update client successfully when identifier is unique', async () => {
            // Arrange
            const request = {
                id: 1,
                name: 'João Silva Updated',
                identifier: '11144477735'
            };

            const updatedClient = new Client({
                name: request.name,
                identifier: request.identifier
            }, request.id);

            mockClientRepository.findByIdentifier.mockResolvedValue(null);
            mockClientRepository.update.mockResolvedValue(updatedClient);

            // Act
            const result = await useCase.execute(request);

            // Assert
            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.update).toHaveBeenCalledWith(request.id, {
                name: request.name,
                identifier: request.identifier
            });
            expect(result).toEqual({
                id: request.id,
                name: request.name,
                identifier: request.identifier
            });
        });

        it('should update client when identifier belongs to same client', async () => {
            // Arrange
            const request = {
                id: 1,
                name: 'João Silva Updated',
                identifier: '11144477735'
            };

            const existingClient = new Client({
                name: 'João Silva',
                identifier: request.identifier
            }, request.id);

            const updatedClient = new Client({
                name: request.name,
                identifier: request.identifier
            }, request.id);

            mockClientRepository.findByIdentifier.mockResolvedValue(existingClient);
            mockClientRepository.update.mockResolvedValue(updatedClient);

            // Act
            const result = await useCase.execute(request);

            // Assert
            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.update).toHaveBeenCalledWith(request.id, {
                name: request.name,
                identifier: request.identifier
            });
            expect(result).toEqual({
                id: request.id,
                name: request.name,
                identifier: request.identifier
            });
        });

        it('should throw ConflictError when identifier belongs to different client', async () => {
            // Arrange
            const request = {
                id: 1,
                name: 'João Silva Updated',
                identifier: '11144477735'
            };

            const existingClient = new Client({
                name: 'Other Client',
                identifier: request.identifier
            }, 2); // Different ID

            mockClientRepository.findByIdentifier.mockResolvedValue(existingClient);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow(ConflictHttpError);
            await expect(useCase.execute(request)).rejects.toThrow('Falha ao atualizar cliente');

            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.update).not.toHaveBeenCalled();
        });

        it('should handle repository errors', async () => {
            // Arrange
            const request = {
                id: 1,
                name: 'João Silva Updated',
                identifier: '11144477735'
            };

            const error = new Error('Database connection failed');
            mockClientRepository.findByIdentifier.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow(ConflictHttpError);
            await expect(useCase.execute(request)).rejects.toThrow('Falha ao atualizar cliente');

            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.update).not.toHaveBeenCalled();
        });

        it('should handle update repository errors', async () => {
            // Arrange
            const request = {
                id: 1,
                name: 'João Silva Updated',
                identifier: '11144477735'
            };

            const updateError = new Error('Failed to update');
            mockClientRepository.findByIdentifier.mockResolvedValue(null);
            mockClientRepository.update.mockRejectedValue(updateError);

            // Act & Assert
            await expect(useCase.execute(request)).rejects.toThrow(ConflictHttpError);
            await expect(useCase.execute(request)).rejects.toThrow('Falha ao atualizar cliente');

            expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(request.identifier);
            expect(mockClientRepository.update).toHaveBeenCalledWith(request.id, {
                name: request.name,
                identifier: request.identifier
            });
        });
    });
});
