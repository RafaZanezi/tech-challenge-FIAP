import { PostgresSupplyRepository } from './postgres-supply.repository';
import { Supply } from '../../domain/supply.entity';
import db from '../../../../shared/infrastructure/database/connection';

jest.mock('../../../../shared/infrastructure/database/connection', () => ({
    query: jest.fn()
}));

describe('PostgresSupplyRepository', () => {
    let repository: PostgresSupplyRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new PostgresSupplyRepository();
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return supply when found', async () => {
            const mockRow = {
                id: 1,
                name: 'Test Supply',
                quantity: 10,
                price: '50.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findById(1);

            expect(result).toBeInstanceOf(Supply);
            expect(result?.id).toBe(1);
            expect(result?.name).toBe('Test Supply');
            expect(result?.quantity).toBe(10);
            expect(result?.price).toBe(50);
        });

        it('should return null when supply not found', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            const result = await repository.findById(1);

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findById(1)).rejects.toThrow('Failed to find supply by id');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding supply by id:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('findAll', () => {
        it('should return all supplies', async () => {
            const mockRows = [
                { id: 1, name: 'Supply 1', quantity: 10, price: '50.00' },
                { id: 2, name: 'Supply 2', quantity: 20, price: '75.00' }
            ];
            mockDb.query.mockResolvedValue({ rows: mockRows });

            const result = await repository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Supply);
            expect(result[1]).toBeInstanceOf(Supply);
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAll()).rejects.toThrow('Failed to find all supplies');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding all supplies:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('save', () => {
        it('should save supply successfully', async () => {
            const supply = new Supply({
                name: 'New Supply',
                quantity: 15,
                price: 60
            });

            const mockRow = {
                id: 1,
                name: 'New Supply',
                quantity: 15,
                price: '60.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.save(supply);

            expect(result).toBeInstanceOf(Supply);
            expect(result.id).toBe(1);
            expect(mockDb.query).toHaveBeenCalledWith(
                'INSERT INTO supplies (name, quantity, price) VALUES ($1, $2, $3) RETURNING id, name, quantity, price',
                ['New Supply', 15, 60]
            );
        });

        it('should handle database errors', async () => {
            const supply = new Supply({
                name: 'New Supply',
                quantity: 15,
                price: 60
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(supply)).rejects.toThrow('Failed to save supply');
            expect(consoleSpy).toHaveBeenCalledWith('Error saving supply:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('update', () => {
        it('should update supply successfully', async () => {
            // Mock findById call
            const currentSupply = {
                id: 1,
                name: 'Current Supply',
                quantity: 10,
                price: '50.00'
            };
            
            const updatedSupply = {
                id: 1,
                name: 'Updated Supply',
                quantity: 10,
                price: '50.00'
            };

            mockDb.query
                .mockResolvedValueOnce({ rows: [currentSupply] }) // findById
                .mockResolvedValueOnce({ rows: [updatedSupply] }); // update

            const updateData = { name: 'Updated Supply' };
            const result = await repository.update(1, updateData);

            expect(result).toBeInstanceOf(Supply);
            expect(result.name).toBe('Updated Supply');
        });

        it('should throw error when supply not found for update', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            await expect(repository.update(1, { name: 'Updated' })).rejects.toThrow('Failed to update supply');
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.update(1, { name: 'Updated' })).rejects.toThrow('Failed to update supply');
            expect(consoleSpy).toHaveBeenCalledWith('Error updating supply:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('delete', () => {
        it('should delete supply successfully', async () => {
            mockDb.query.mockResolvedValue({ rowCount: 1 });

            await repository.delete(1);

            expect(mockDb.query).toHaveBeenCalledWith(
                'DELETE FROM supplies WHERE id = $1',
                [1]
            );
        });

        it('should throw error when supply not found for deletion', async () => {
            mockDb.query.mockResolvedValue({ rowCount: 0 });

            await expect(repository.delete(1)).rejects.toThrow('Failed to delete supply');
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.delete(1)).rejects.toThrow('Failed to delete supply');
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting supply:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('findByName', () => {
        it('should return supply when found by name', async () => {
            const mockRow = {
                id: 1,
                name: 'Test Supply',
                quantity: 10,
                price: '50.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findByName('Test Supply');

            expect(result).toBeInstanceOf(Supply);
            expect(result?.name).toBe('Test Supply');
        });

        it('should return null when supply not found by name', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            const result = await repository.findByName('Non-existent');

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByName('Test')).rejects.toThrow('Failed to find supply by name');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding supply by name:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });
});
