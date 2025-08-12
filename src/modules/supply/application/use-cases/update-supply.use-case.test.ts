import { UpdateSupplyUseCase } from './update-supply.use-case';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('UpdateSupplyUseCase', () => {
    let useCase: UpdateSupplyUseCase;
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

        useCase = new UpdateSupplyUseCase(mockSupplyRepository);
    });

    it('should update supply successfully', async () => {
        const existingSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        const updateData = {
            id: 1,
            name: 'Premium Engine Oil',
            quantity: 15,
            price: 35.00,
        };

        mockSupplyRepository.findById.mockResolvedValue(existingSupply);
        mockSupplyRepository.update.mockResolvedValue(existingSupply);

        const result = await useCase.execute(updateData);

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.update).toHaveBeenCalledWith(1, existingSupply);
        expect(result).toEqual({
            id: 1,
            name: 'Premium Engine Oil',
            quantity: 15,
            price: 35.00,
        });
    });

    it('should throw NotFoundError when supply does not exist', async () => {
        const updateData = {
            id: 999,
            name: 'Premium Engine Oil',
        };

        mockSupplyRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(updateData)).rejects.toThrow(
            new NotFoundError('Supply', '999')
        );

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(999);
        expect(mockSupplyRepository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
        const existingSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        const updateData = {
            id: 1,
            quantity: 15,
        };

        mockSupplyRepository.findById.mockResolvedValue(existingSupply);
        mockSupplyRepository.update.mockResolvedValue(existingSupply);

        await useCase.execute(updateData);

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.update).toHaveBeenCalledWith(1, existingSupply);
    });

    it('should handle zero values for quantity and price', async () => {
        const existingSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        const updateData = {
            id: 1,
            quantity: 0,
            price: 0,
        };

        mockSupplyRepository.findById.mockResolvedValue(existingSupply);
        mockSupplyRepository.update.mockResolvedValue(existingSupply);

        await useCase.execute(updateData);

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.update).toHaveBeenCalledWith(1, existingSupply);
    });

    it('should handle repository errors during update', async () => {
        const existingSupply = new Supply({
            name: 'Engine Oil',
            quantity: 10,
            price: 25.00,
        }, 1);

        const updateData = {
            id: 1,
            name: 'Premium Engine Oil',
        };

        mockSupplyRepository.findById.mockResolvedValue(existingSupply);
        mockSupplyRepository.update.mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(updateData)).rejects.toThrow('Database error');

        expect(mockSupplyRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSupplyRepository.update).toHaveBeenCalledWith(1, existingSupply);
    });
});
