import { FindAllServicesUseCase } from './find-all-services.use-case';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';

describe('FindAllServicesUseCase', () => {
    let findAllServicesUseCase: FindAllServicesUseCase;
    let mockServiceRepository: jest.Mocked<ServiceRepository>;

    beforeEach(() => {
        mockServiceRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByName: jest.fn()
        };

        findAllServicesUseCase = new FindAllServicesUseCase(mockServiceRepository);
    });

    describe('execute', () => {
        it('should return all services successfully', async () => {
            // Arrange
            const mockServices = [
                new Service({ 
                    name: 'Troca de Óleo', 
                    description: 'Troca completa do óleo do motor', 
                    price: 120.50 
                }, 1),
                new Service({ 
                    name: 'Alinhamento', 
                    description: 'Alinhamento e balanceamento das rodas', 
                    price: 80.00 
                }, 2)
            ];

            mockServiceRepository.findAll.mockResolvedValue(mockServices);

            // Act
            const result = await findAllServicesUseCase.execute();

            // Assert
            expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                name: 'Troca de Óleo',
                description: 'Troca completa do óleo do motor',
                price: 120.50
            });
            expect(result[1]).toEqual({
                id: 2,
                name: 'Alinhamento',
                description: 'Alinhamento e balanceamento das rodas',
                price: 80.00
            });
        });

        it('should return empty array when no services exist', async () => {
            // Arrange
            mockServiceRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await findAllServicesUseCase.execute();

            // Assert
            expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });

        it('should handle repository errors', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            mockServiceRepository.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(findAllServicesUseCase.execute()).rejects.toThrow('Database connection failed');
            expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should map service properties correctly', async () => {
            // Arrange
            const mockService = new Service({ 
                name: 'Revisão Geral', 
                description: 'Revisão completa do veículo', 
                price: 350.99 
            }, 999);
            
            mockServiceRepository.findAll.mockResolvedValue([mockService]);

            // Act
            const result = await findAllServicesUseCase.execute();

            // Assert
            expect(result[0]).toEqual({
                id: 999,
                name: 'Revisão Geral',
                description: 'Revisão completa do veículo',
                price: 350.99
            });
        });

        it('should handle multiple services with different prices', async () => {
            // Arrange
            const mockServices = [
                new Service({ name: 'Serviço A', description: 'Descrição A', price: 10.50 }, 1),
                new Service({ name: 'Serviço B', description: 'Descrição B', price: 999.99 }, 2),
                new Service({ name: 'Serviço C', description: 'Descrição C', price: 0.01 }, 3)
            ];

            mockServiceRepository.findAll.mockResolvedValue(mockServices);

            // Act
            const result = await findAllServicesUseCase.execute();

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].price).toBe(10.50);
            expect(result[1].price).toBe(999.99);
            expect(result[2].price).toBe(0.01);
        });
    });
});
