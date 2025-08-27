import { DeleteSupplyUseCase } from './delete-supply.use-case';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('DeleteSupplyUseCase', () => {
    let useCase: DeleteSupplyUseCase;
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

        useCase = new DeleteSupplyUseCase(mockSupplyRepository);
    });

    it('should delete supply successfully', async () => {
        const mockSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        mockSupplyRepository.findById.mockResolvedValue(mockSupply);
        mockSupplyRepository.delete.mockResolvedValue(undefined);

        await useCase.execute(1);

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when supply does not exist', async () => {
        mockSupplyRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(999)).rejects.toThrow(
            new NotFoundError('Supply', '999')
        );

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(999);
        expect(mockSupplyRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
        const mockSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        mockSupplyRepository.findById.mockResolvedValue(mockSupply);
        mockSupplyRepository.delete.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle repository errors during find', async () => {
        mockSupplyRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(1)).rejects.toThrow('Database error');

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.delete).not.toHaveBeenCalled();
    });
});
