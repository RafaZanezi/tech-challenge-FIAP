import { PostgresVehicleRepository } from './postgres-vehicle.repository';
import { Vehicle } from '../../domain/vehicle.entity';
import connection from '../../../../shared/infrastructure/database/connection';

jest.mock('../../../../shared/infrastructure/database/connection', () => ({
    query: jest.fn()
}));

describe('PostgresVehicleRepository', () => {
    let repository: PostgresVehicleRepository;
    const mockConnection = connection as jest.Mocked<typeof connection>;

    beforeEach(() => {
        repository = new PostgresVehicleRepository();
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return vehicle when found', async () => {
            const mockRow = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
                license_plate: 'ABC-1234',
                client_id: 1
            };
            mockConnection.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findById(1);

            expect(result).toBeInstanceOf(Vehicle);
            expect(result?.id).toBe(1);
            expect(result?.brand).toBe('Toyota');
            expect(result?.model).toBe('Corolla');
            expect(result?.year).toBe(2023);
            expect(result?.licensePlate).toBe('ABC-1234');
            expect(result?.clientId).toBe(1);
        });

        it('should return null when vehicle not found', async () => {
            mockConnection.query.mockResolvedValue({ rows: [] });

            const result = await repository.findById(1);

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return all vehicles', async () => {
            const mockRows = [
                {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2023,
                    license_plate: 'ABC-1234',
                    client_id: 1
                },
                {
                    id: 2,
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2024,
                    license_plate: 'DEF-5678',
                    client_id: 2
                }
            ];
            mockConnection.query.mockResolvedValue({ rows: mockRows });

            const result = await repository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Vehicle);
            expect(result[1]).toBeInstanceOf(Vehicle);
            expect(result[0].brand).toBe('Toyota');
            expect(result[1].brand).toBe('Honda');
        });
    });

    describe('save', () => {
        it('should save vehicle successfully', async () => {
            const vehicle = new Vehicle({
                brand: 'Ford',
                model: 'Focus',
                year: 2022,
                licensePlate: 'XYZ-9876',
                clientId: 3
            });

            const mockRow = {
                id: 1,
                brand: 'Ford',
                model: 'Focus',
                year: 2022,
                license_plate: 'XYZ-9876',
                client_id: 3
            };
            mockConnection.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.save(vehicle);

            expect(result).toBeInstanceOf(Vehicle);
            expect(result.id).toBe(1);
            expect(result.brand).toBe('Ford');
            expect(mockConnection.query).toHaveBeenCalledWith(
                'INSERT INTO vehicles (brand, model, year, license_plate, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                ['Ford', 'Focus', 2022, 'XYZ-9876', 3]
            );
        });
    });

    describe('update', () => {
        it('should update vehicle successfully with all fields', async () => {
            const updateData = {
                brand: 'Updated Brand',
                model: 'Updated Model',
                year: 2024,
                licensePlate: 'UPD-1234',
                clientId: 5
            };

            const mockRow = {
                id: 1,
                brand: 'Updated Brand',
                model: 'Updated Model',
                year: 2024,
                license_plate: 'UPD-1234',
                client_id: 5
            };
            mockConnection.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.update(1, updateData);

            expect(result).toBeInstanceOf(Vehicle);
            expect(result.brand).toBe('Updated Brand');
            expect(result.model).toBe('Updated Model');
        });

        it('should update vehicle with partial data', async () => {
            const updateData = { brand: 'New Brand' };

            const mockRow = {
                id: 1,
                brand: 'New Brand',
                model: 'Original Model',
                year: 2023,
                license_plate: 'ABC-1234',
                client_id: 1
            };
            mockConnection.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.update(1, updateData);

            expect(result).toBeInstanceOf(Vehicle);
            expect(result.brand).toBe('New Brand');
        });

        it('should throw error when vehicle not found for update', async () => {
            mockConnection.query.mockResolvedValue({ rows: [] });

            await expect(repository.update(1, { brand: 'Updated' }))
                .rejects.toThrow('Vehicle not found for update');
        });
    });

    describe('delete', () => {
        it('should delete vehicle successfully', async () => {
            mockConnection.query.mockResolvedValue({});

            await repository.delete(1);

            expect(mockConnection.query).toHaveBeenCalledWith(
                'DELETE FROM vehicles WHERE id = $1',
                [1]
            );
        });
    });

    describe('findByLicensePlate', () => {
        it('should return vehicle when found by license plate', async () => {
            const mockRow = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
                license_plate: 'ABC-1234',
                client_id: 1
            };
            mockConnection.query.mockResolvedValue({ rows: [mockRow] });

            const result = await repository.findByLicensePlate('ABC-1234');

            expect(result).toBeInstanceOf(Vehicle);
            expect(result?.licensePlate).toBe('ABC-1234');
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM vehicles WHERE license_plate = $1',
                ['ABC-1234']
            );
        });

        it('should return null when vehicle not found by license plate', async () => {
            mockConnection.query.mockResolvedValue({ rows: [] });

            const result = await repository.findByLicensePlate('NON-EXIST');

            expect(result).toBeNull();
        });
    });

    describe('findByClientId', () => {
        it('should return vehicles for client', async () => {
            const mockRows = [
                {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2023,
                    license_plate: 'ABC-1234',
                    client_id: 1
                },
                {
                    id: 2,
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2024,
                    license_plate: 'DEF-5678',
                    client_id: 1
                }
            ];
            mockConnection.query.mockResolvedValue({ rows: mockRows });

            const result = await repository.findByClientId(1);

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Vehicle);
            expect(result[1]).toBeInstanceOf(Vehicle);
            expect(result[0].clientId).toBe(1);
            expect(result[1].clientId).toBe(1);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM vehicles WHERE client_id = $1 ORDER BY id DESC',
                [1]
            );
        });

        it('should return empty array when no vehicles found for client', async () => {
            mockConnection.query.mockResolvedValue({ rows: [] });

            const result = await repository.findByClientId(999);

            expect(result).toEqual([]);
        });
    });
});
