import { FindAllSuppliesUseCase } from './find-all-supplies.use-case';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';

describe('FindAllSuppliesUseCase', () => {
    let findAllSuppliesUseCase: FindAllSuppliesUseCase;
    let mockSupplyRepository: jest.Mocked<SupplyRepository>;

    beforeEach(() => {
        mockSupplyRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByName: jest.fn()
        };

        findAllSuppliesUseCase = new FindAllSuppliesUseCase(mockSupplyRepository);
    });

    describe('execute', () => {
        it('should return all supplies successfully', async () => {
            // Arrange
            const mockSupplies = [
                new Supply({ 
                    name: 'Óleo Motor 5W30', 
                    quantity: 50, 
                    price: 25.90 
                }, 1),
                new Supply({ 
                    name: 'Filtro de Ar', 
                    quantity: 30, 
                    price: 15.50 
                }, 2)
            ];

            mockSupplyRepository.findAll.mockResolvedValue(mockSupplies);

            // Act
            const result = await findAllSuppliesUseCase.execute();

            // Assert
            expect(mockSupplyRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                name: 'Óleo Motor 5W30',
                quantity: 50,
                price: 25.90
            });
            expect(result[1]).toEqual({
                id: 2,
                name: 'Filtro de Ar',
                quantity: 30,
                price: 15.50
            });
        });

        it('should return empty array when no supplies exist', async () => {
            // Arrange
            mockSupplyRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await findAllSuppliesUseCase.execute();

            // Assert
            expect(mockSupplyRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });

        it('should handle repository errors', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            mockSupplyRepository.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(findAllSuppliesUseCase.execute()).rejects.toThrow('Database connection failed');
            expect(mockSupplyRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should map supply properties correctly', async () => {
            // Arrange
            const mockSupply = new Supply({ 
                name: 'Pneu 195/65R15', 
                quantity: 8, 
                price: 280.00 
            }, 999);
            
            mockSupplyRepository.findAll.mockResolvedValue([mockSupply]);

            // Act
            const result = await findAllSuppliesUseCase.execute();

            // Assert
            expect(result[0]).toEqual({
                id: 999,
                name: 'Pneu 195/65R15',
                quantity: 8,
                price: 280.00
            });
        });

        it('should handle supplies with zero quantity and price', async () => {
            // Arrange
            const mockSupplies = [
                new Supply({ name: 'Item A', quantity: 0, price: 0 }, 1),
                new Supply({ name: 'Item B', quantity: 100, price: 999.99 }, 2)
            ];

            mockSupplyRepository.findAll.mockResolvedValue(mockSupplies);

            // Act
            const result = await findAllSuppliesUseCase.execute();

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].quantity).toBe(0);
            expect(result[0].price).toBe(0);
            expect(result[1].quantity).toBe(100);
            expect(result[1].price).toBe(999.99);
        });
    });
});
