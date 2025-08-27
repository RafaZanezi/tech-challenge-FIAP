import { CreateSupplyUseCase } from './create-supply.use-case';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';

describe('CreateSupplyUseCase', () => {
    let useCase: CreateSupplyUseCase;
    let mockSupplyRepository: jest.Mocked<SupplyRepository>;

    beforeEach(() => {
        mockSupplyRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        useCase = new CreateSupplyUseCase(mockSupplyRepository);
    });

    it('should create supply successfully', async () => {
        const supplyData = {
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        };

        const savedSupply = new Supply(supplyData, 1);

        mockSupplyRepository.findByName.mockResolvedValue(null);
        mockSupplyRepository.save.mockResolvedValue(savedSupply);

        const result = await useCase.execute(supplyData);

        expect(mockSupplyRepository.findByName).toHaveBeenCalledWith('Engine Oil');
        expect(mockSupplyRepository.save).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        });
    });

    it('should throw ConflictError when supply with same name exists', async () => {
        const supplyData = {
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        };

        const existingSupply = new Supply(supplyData, 1);
        mockSupplyRepository.findByName.mockResolvedValue(existingSupply);

        await expect(useCase.execute(supplyData)).rejects.toThrow(
            new ConflictError('Insumo com este nome já existe, atualize a quantidade de itens ao invés de criar um novo.')
        );

        expect(mockSupplyRepository.findByName).toHaveBeenCalledWith('Engine Oil');
        expect(mockSupplyRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
        const supplyData = {
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        };

        mockSupplyRepository.findByName.mockResolvedValue(null);
        mockSupplyRepository.save.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(supplyData)).rejects.toThrow('Database error');

        expect(mockSupplyRepository.findByName).toHaveBeenCalledWith('Engine Oil');
        expect(mockSupplyRepository.save).toHaveBeenCalled();
    });
});
