import { VehicleGateway } from './vehicle';
import { Vehicle } from '../entities/vehicle';
import { DatabaseConnection } from '../interfaces/connection';
import { PostgresConnection } from '../external/postgres/database-queries';

// Mock da PostgresConnection
jest.mock('../external/postgres/database-queries');

describe('VehicleGateway', () => {
    let vehicleGateway: VehicleGateway;
    let mockDatabase: jest.Mocked<DatabaseConnection>;
    let mockPostgresConnection: jest.Mocked<PostgresConnection>;

    beforeEach(() => {
        mockDatabase = {
            query: jest.fn(),
        } as unknown as jest.Mocked<DatabaseConnection>;

        mockPostgresConnection = {
            findAll: jest.fn(),
            findByParams: jest.fn(),
            findAllByParams: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<PostgresConnection>;

        (PostgresConnection as jest.MockedClass<typeof PostgresConnection>).mockImplementation(() => mockPostgresConnection);

        vehicleGateway = new VehicleGateway(mockDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should call findAll and map snake_case to camelCase', async () => {
            const mockVehiclesFromDb = [
                { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, license_plate: 'ABC-1234', client_id: 1 },
                { id: 2, brand: 'Honda', model: 'Civic', year: 2021, license_plate: 'XYZ-5678', client_id: 2 }
            ];

            mockPostgresConnection.findAll.mockResolvedValue(mockVehiclesFromDb);

            const result = await vehicleGateway.findAll();

            expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('vehicles', null);
            expect(result).toEqual([
                { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, licensePlate: 'ABC-1234', clientId: 1 },
                { id: 2, brand: 'Honda', model: 'Civic', year: 2021, licensePlate: 'XYZ-5678', clientId: 2 }
            ]);
        });

        it('should return empty array when no vehicles found', async () => {
            mockPostgresConnection.findAll.mockResolvedValue([]);

            const result = await vehicleGateway.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should call findByParams and map snake_case to camelCase', async () => {
            const mockVehicleFromDb = { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, license_plate: 'ABC-1234', client_id: 1 };
            const vehicleId = 1;

            mockPostgresConnection.findByParams.mockResolvedValue(mockVehicleFromDb);

            const result = await vehicleGateway.findById(vehicleId);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('vehicles', null, { id: vehicleId });
            expect(result).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
        });

        it('should return null when vehicle not found', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await vehicleGateway.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByLicensePlate', () => {
        it('should call findByParams with license_plate and map result', async () => {
            const mockVehicleFromDb = { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, license_plate: 'ABC-1234', client_id: 1 };
            const licensePlate = 'ABC-1234';

            mockPostgresConnection.findByParams.mockResolvedValue(mockVehicleFromDb);

            const result = await vehicleGateway.findByLicensePlate(licensePlate);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('vehicles', null, { license_plate: licensePlate });
            expect(result).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
        });

        it('should return null when vehicle not found by license plate', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await vehicleGateway.findByLicensePlate('UNKNOWN-123');

            expect(result).toBeNull();
        });
    });

    describe('findByClientId', () => {
        it('should call findAllByParams with client_id and map results', async () => {
            const mockVehiclesFromDb = [
                { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, license_plate: 'ABC-1234', client_id: 1 },
                { id: 2, brand: 'Honda', model: 'Civic', year: 2021, license_plate: 'XYZ-5678', client_id: 1 }
            ];
            const clientId = 1;

            mockPostgresConnection.findAllByParams.mockResolvedValue(mockVehiclesFromDb);

            const result = await vehicleGateway.findByClientId(clientId);

            expect(mockPostgresConnection.findAllByParams).toHaveBeenCalledWith('vehicles', null, { client_id: clientId });
            expect(result).toEqual([
                { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, licensePlate: 'ABC-1234', clientId: 1 },
                { id: 2, brand: 'Honda', model: 'Civic', year: 2021, licensePlate: 'XYZ-5678', clientId: 1 }
            ]);
        });

        it('should return empty array when no vehicles found for client', async () => {
            mockPostgresConnection.findAllByParams.mockResolvedValue([]);

            const result = await vehicleGateway.findByClientId(999);

            expect(result).toEqual([]);
        });
    });

    describe('insert', () => {
        it('should map camelCase to snake_case for database and map result back', async () => {
            const vehicle = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            const mockInsertedVehicleFromDb = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'ABC-1234',
                client_id: 1
            };

            mockPostgresConnection.insert.mockResolvedValue(mockInsertedVehicleFromDb);

            const result = await vehicleGateway.insert(vehicle);

            expect(mockPostgresConnection.insert).toHaveBeenCalledWith('vehicles', {
                props: {
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2020,
                    license_plate: 'ABC-1234',
                    client_id: 1
                }
            });

            expect(result).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
        });
    });

    describe('update', () => {
        it('should map camelCase to snake_case for database and map result back', async () => {
            const vehicleId = 1;
            const updateData = {
                brand: 'Toyota',
                model: 'Camry',
                licensePlate: 'NEW-1234',
                clientId: 2
            };

            const mockUpdatedVehicleFromDb = {
                id: 1,
                brand: 'Toyota',
                model: 'Camry',
                year: 2020,
                license_plate: 'NEW-1234',
                client_id: 2
            };

            mockPostgresConnection.update.mockResolvedValue(mockUpdatedVehicleFromDb);

            const result = await vehicleGateway.update(vehicleId, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('vehicles', vehicleId, {
                brand: 'Toyota',
                model: 'Camry',
                license_plate: 'NEW-1234',
                client_id: 2
            });

            expect(result).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Camry',
                year: 2020,
                licensePlate: 'NEW-1234',
                clientId: 2
            });
        });

        it('should handle partial updates with only provided fields', async () => {
            const vehicleId = 1;
            const updateData = { year: 2022 };

            const mockUpdatedVehicleFromDb = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                license_plate: 'ABC-1234',
                client_id: 1
            };

            mockPostgresConnection.update.mockResolvedValue(mockUpdatedVehicleFromDb);

            const result = await vehicleGateway.update(vehicleId, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('vehicles', vehicleId, {
                year: 2022
            });

            expect(result).toEqual({
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
        });

        it('should handle undefined values correctly', async () => {
            const vehicleId = 1;
            const updateData = {
                brand: 'Honda',
                model: undefined,
                year: 2021,
                licensePlate: undefined,
                clientId: undefined
            };

            const mockUpdatedVehicleFromDb = {
                id: 1,
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                license_plate: 'ABC-1234',
                client_id: 1
            };

            mockPostgresConnection.update.mockResolvedValue(mockUpdatedVehicleFromDb);

            const result = await vehicleGateway.update(vehicleId, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('vehicles', vehicleId, {
                brand: 'Honda',
                year: 2021
            });

            expect(result).toEqual({
                id: 1,
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'ABC-1234',
                clientId: 1
            });
        });
    });

    describe('delete', () => {
        it('should call delete with correct parameters', async () => {
            const vehicleId = 1;

            mockPostgresConnection.delete.mockResolvedValue(undefined);

            await vehicleGateway.delete(vehicleId);

            expect(mockPostgresConnection.delete).toHaveBeenCalledWith('vehicles', vehicleId);
        });
    });

    describe('constructor', () => {
        it('should initialize with correct table name', () => {
            expect(vehicleGateway).toBeInstanceOf(VehicleGateway);
            expect(PostgresConnection).toHaveBeenCalledWith(mockDatabase);
        });
    });
});