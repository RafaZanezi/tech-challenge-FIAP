import { FindSupplyUseCase } from './find-supply.use-case';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('FindSupplyUseCase', () => {
    let useCase: FindSupplyUseCase;
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

        useCase = new FindSupplyUseCase(mockSupplyRepository);
    });

    it('should return supply when found', async () => {
        const mockSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        mockSupplyRepository.findById.mockResolvedValue(mockSupply);

        const result = await useCase.execute({ id: 1 });

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual({
            id: 1,
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        });
    });

    it('should throw NotFoundError when supply not found', async () => {
        mockSupplyRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 })).rejects.toThrow(
            new NotFoundError('Supply', '999')
        );

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should handle repository errors', async () => {
        mockSupplyRepository.findById.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute({ id: 1 })).rejects.toThrow('Database error');

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
    });
});
