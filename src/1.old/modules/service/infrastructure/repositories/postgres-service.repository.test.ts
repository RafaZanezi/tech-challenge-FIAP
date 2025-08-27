import { PostgresServiceRepository } from './postgres-service.repository';
import { Service } from '../../domain/service.entity';
import db from '../../../../shared/infrastructure/database/connection';

jest.mock('../../../../shared/infrastructure/database/connection', () => ({
    query: jest.fn()
}));

describe('PostgresServiceRepository', () => {
    let repository: PostgresServiceRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new PostgresServiceRepository();
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return service when found', async () => {
            const mockRow = {
                id: 1,
                name: 'Test Service',
                description: 'Test Description',
                price: '100.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findById(1);

            expect(result).toBeInstanceOf(Service);
            expect(result?.id).toBe(1);
            expect(result?.name).toBe('Test Service');
            expect(result?.description).toBe('Test Description');
            expect(result?.price).toBe(100);
        });

        it('should return null when service not found', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            const result = await repository.findById(1);

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findById(1)).rejects.toThrow('Failed to find service by id');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding service by id:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('findAll', () => {
        it('should return all services', async () => {
            const mockRows = [
                { id: 1, name: 'Service 1', description: 'Desc 1', price: '100.00' },
                { id: 2, name: 'Service 2', description: 'Desc 2', price: '200.00' }
            ];
            mockDb.query.mockResolvedValue({ rows: mockRows });

            const result = await repository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Service);
            expect(result[1]).toBeInstanceOf(Service);
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAll()).rejects.toThrow('Failed to find all services');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding all services:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('save', () => {
        it('should save service successfully', async () => {
            const service = new Service({
                name: 'New Service',
                description: 'New Description',
                price: 150
            });

            const mockRow = {
                id: 1,
                name: 'New Service',
                description: 'New Description',
                price: '150.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.save(service);

            expect(result).toBeInstanceOf(Service);
            expect(result.id).toBe(1);
            expect(mockDb.query).toHaveBeenCalledWith(
                'INSERT INTO services (name, description, price) VALUES ($1, $2, $3) RETURNING id, name, description, price',
                ['New Service', 'New Description', 150]
            );
        });

        it('should handle database errors', async () => {
            const service = new Service({
                name: 'New Service',
                description: 'New Description',
                price: 150
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(service)).rejects.toThrow('Failed to save service');
            expect(consoleSpy).toHaveBeenCalledWith('Error saving service:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('update', () => {
        it('should update service successfully', async () => {
            // Mock findById call
            const currentService = {
                id: 1,
                name: 'Current Service',
                description: 'Current Description',
                price: '100.00'
            };
            
            const updatedService = {
                id: 1,
                name: 'Updated Service',
                description: 'Current Description',
                price: '100.00'
            };

            mockDb.query
                .mockResolvedValueOnce({ rows: [currentService] }) // findById
                .mockResolvedValueOnce({ rows: [updatedService] }); // update

            const updateData = { name: 'Updated Service' };
            const result = await repository.update(1, updateData);

            expect(result).toBeInstanceOf(Service);
            expect(result.name).toBe('Updated Service');
        });

        it('should throw error when service not found for update', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            await expect(repository.update(1, { name: 'Updated' })).rejects.toThrow('Failed to update service');
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.update(1, { name: 'Updated' })).rejects.toThrow('Failed to update service');
            expect(consoleSpy).toHaveBeenCalledWith('Error updating service:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('delete', () => {
        it('should delete service successfully', async () => {
            mockDb.query.mockResolvedValue({ rowCount: 1 });

            await repository.delete(1);

            expect(mockDb.query).toHaveBeenCalledWith(
                'DELETE FROM services WHERE id = $1',
                [1]
            );
        });

        it('should throw error when service not found for deletion', async () => {
            mockDb.query.mockResolvedValue({ rowCount: 0 });

            await expect(repository.delete(1)).rejects.toThrow('Failed to delete service');
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.delete(1)).rejects.toThrow('Failed to delete service');
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting service:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('findByName', () => {
        it('should return service when found by name', async () => {
            const mockRow = {
                id: 1,
                name: 'Test Service',
                description: 'Test Description',
                price: '100.00'
            };
            mockDb.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findByName('Test Service');

            expect(result).toBeInstanceOf(Service);
            expect(result?.name).toBe('Test Service');
        });

        it('should return null when service not found by name', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            const result = await repository.findByName('Non-existent');

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDb.query.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByName('Test')).rejects.toThrow('Failed to find service by name');
            expect(consoleSpy).toHaveBeenCalledWith('Error finding service by name:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });
});
