import { ServiceOrderGateway } from './service-order';
import { ServiceOrder } from '../entities/service-order';
import { ServiceOrderStatus } from '../interfaces/enums/service-order-status.enum';
import { Service } from '../entities/service';
import { Supply } from '../entities/supply';
import { DatabaseConnection } from '../interfaces/connection';
import { PostgresConnection } from '../external/postgres/database-queries';

// Mock the PostgresConnection class
jest.mock('../external/postgres/database-queries');

describe('ServiceOrderGateway', () => {
    let serviceOrderGateway: ServiceOrderGateway;
    let mockDbConnection: jest.Mocked<DatabaseConnection>;
    let mockPostgresConnection: jest.Mocked<PostgresConnection>;

    beforeEach(() => {
        mockDbConnection = {
            query: jest.fn(),
            connect: jest.fn(),
            disconnect: jest.fn(),
        };

        mockPostgresConnection = {
            findAll: jest.fn(),
            customQuery: jest.fn(),
            findByParams: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        (PostgresConnection as jest.MockedClass<typeof PostgresConnection>).mockImplementation(() => mockPostgresConnection);

        serviceOrderGateway = new ServiceOrderGateway(mockDbConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should find all service orders successfully', async () => {
            const mockDbResults = [
                {
                    id: 1,
                    client_id: 1,
                    vehicle_id: 1,
                    services: JSON.stringify([{ id: 1, name: 'Oil change', description: 'Change oil', price: 50 }]),
                    supplies: JSON.stringify([{ id: 1, name: 'Oil', quantity: 1, price: 25 }]),
                    status: ServiceOrderStatus.RECEIVED,
                    created_at: new Date('2023-01-01'),
                    finalized_at: null
                }
            ];

            mockPostgresConnection.findAll.mockResolvedValue(mockDbResults);

            const result = await serviceOrderGateway.findAll();

            expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('service_orders', null);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
            expect(result[0].clientId).toBe(1);
            expect(result[0].vehicleId).toBe(1);
            expect(result[0].status).toBe(ServiceOrderStatus.RECEIVED);
        });

        it('should handle database errors during findAll', async () => {
            mockPostgresConnection.findAll.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('findAllActiveWithOrdering', () => {
        it('should find all active service orders with proper ordering', async () => {
            const mockDbResults = [
                {
                    id: 1,
                    client_id: 1,
                    vehicle_id: 1,
                    services: JSON.stringify([]),
                    supplies: JSON.stringify([]),
                    status: ServiceOrderStatus.IN_PROGRESS,
                    created_at: new Date('2023-01-01'),
                    finalized_at: null
                },
                {
                    id: 2,
                    client_id: 2,
                    vehicle_id: 2,
                    services: JSON.stringify([]),
                    supplies: JSON.stringify([]),
                    status: ServiceOrderStatus.RECEIVED,
                    created_at: new Date('2023-01-02'),
                    finalized_at: null
                }
            ];

            mockPostgresConnection.customQuery.mockResolvedValue(mockDbResults);

            const result = await serviceOrderGateway.findAllActiveWithOrdering();

            expect(mockPostgresConnection.customQuery).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].status).toBe(ServiceOrderStatus.IN_PROGRESS);
            expect(result[1].status).toBe(ServiceOrderStatus.RECEIVED);
        });

        it('should handle database errors during findAllActiveWithOrdering', async () => {
            mockPostgresConnection.customQuery.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.findAllActiveWithOrdering()).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should find service order by id successfully', async () => {
            const mockDbResult = {
                id: 1,
                client_id: 1,
                vehicle_id: 1,
                services: JSON.stringify([{ id: 1, name: 'Oil change', description: 'Change oil', price: 50 }]),
                supplies: JSON.stringify([{ id: 1, name: 'Oil', quantity: 1, price: 25 }]),
                status: ServiceOrderStatus.RECEIVED,
                created_at: new Date('2023-01-01'),
                finalized_at: null
            };

            mockPostgresConnection.findByParams.mockResolvedValue(mockDbResult);

            const result = await serviceOrderGateway.findById(1);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('service_orders', null, { id: 1 });
            expect(result).not.toBeNull();
            expect(result!.id).toBe(1);
            expect(result!.clientId).toBe(1);
            expect(result!.vehicleId).toBe(1);
        });

        it('should return null when service order not found', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await serviceOrderGateway.findById(999);

            expect(result).toBeNull();
        });

        it('should handle database errors during findById', async () => {
            mockPostgresConnection.findByParams.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.findById(1)).rejects.toThrow('Database error');
        });
    });

    describe('findOpenOSByCarAndClient', () => {
        it('should find open service order by car and client', async () => {
            const mockDbResult = {
                id: 1,
                client_id: 1,
                vehicle_id: 1,
                services: JSON.stringify([]),
                supplies: JSON.stringify([]),
                status: ServiceOrderStatus.IN_PROGRESS,
                created_at: new Date('2023-01-01'),
                finalized_at: null
            };

            mockPostgresConnection.findByParams.mockResolvedValue(mockDbResult);

            const result = await serviceOrderGateway.findOpenOSByCarAndClient(1, 1);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('service_orders', null, {
                vehicleId: 1,
                clientId: 1,
                status: ['RECEIVED', 'IN_DIAGNOSIS', 'WAITING_FOR_APPROVAL', 'APPROVED', 'IN_PROGRESS']
            });
            expect(result).not.toBeNull();
            expect(result!.clientId).toBe(1);
            expect(result!.vehicleId).toBe(1);
        });

        it('should return null when no open service order found', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await serviceOrderGateway.findOpenOSByCarAndClient(1, 1);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new service order successfully', async () => {
            const service = new Service({ name: 'Oil change', description: 'Change oil', price: 50 });
            const supply = new Supply({ name: 'Oil', quantity: 1, price: 25 });

            const serviceOrder = new ServiceOrder({
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [supply],
                status: ServiceOrderStatus.RECEIVED,
                createdAt: new Date('2023-01-01'),
                finalizedAt: null
            });

            const mockDbResult = {
                id: 1,
                client_id: 1,
                vehicle_id: 1,
                services: JSON.stringify([{ id: service.id, name: 'Oil change', description: 'Change oil', price: 50 }]),
                supplies: JSON.stringify([{ id: supply.id, name: 'Oil', quantity: 1, price: 25 }]),
                status: ServiceOrderStatus.RECEIVED,
                created_at: new Date('2023-01-01'),
                finalized_at: null
            };

            mockPostgresConnection.insert.mockResolvedValue(mockDbResult);

            const result = await serviceOrderGateway.create(serviceOrder);

            expect(mockPostgresConnection.insert).toHaveBeenCalledWith('service_orders', expect.objectContaining({
                props: expect.objectContaining({
                    clientId: 1,
                    vehicleId: 1,
                    status: ServiceOrderStatus.RECEIVED
                })
            }));
            expect(result.id).toBe(1);
            expect(result.clientId).toBe(1);
            expect(result.vehicleId).toBe(1);
        });

        it('should handle database errors during create', async () => {
            const service = new Service({ name: 'Test service', description: 'Test', price: 100 });
            const serviceOrder = new ServiceOrder({
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [],
                status: ServiceOrderStatus.RECEIVED,
                createdAt: new Date(),
                finalizedAt: null
            });

            mockPostgresConnection.insert.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.create(serviceOrder)).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update service order successfully', async () => {
            const service = new Service({ name: 'Updated service', description: 'Updated', price: 75 });
            const supply = new Supply({ name: 'Updated supply', quantity: 2, price: 30 });
            
            const updateData = {
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [supply],
                status: ServiceOrderStatus.IN_PROGRESS,
                createdAt: new Date('2023-01-01'),
                finalizedAt: new Date('2023-01-02')
            };

            const mockDbResult = {
                id: 1,
                client_id: 1,
                vehicle_id: 1,
                services: JSON.stringify([{ id: service.id, name: 'Updated service', description: 'Updated', price: 75 }]),
                supplies: JSON.stringify([{ id: supply.id, name: 'Updated supply', quantity: 2, price: 30 }]),
                status: ServiceOrderStatus.IN_PROGRESS,
                created_at: new Date('2023-01-01'),
                finalized_at: new Date('2023-01-02')
            };

            mockPostgresConnection.update.mockResolvedValue(mockDbResult);

            const result = await serviceOrderGateway.update(1, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('service_orders', 1, expect.any(Object));
            expect(result.status).toBe(ServiceOrderStatus.IN_PROGRESS);
        });

        it('should handle database errors during update', async () => {
            const service = new Service({ name: 'Test service', description: 'Test', price: 100 });
            const updateData = {
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [],
                status: ServiceOrderStatus.IN_PROGRESS,
                createdAt: new Date(),
                finalizedAt: null
            };

            mockPostgresConnection.update.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.update(1, updateData)).rejects.toThrow('Database error');
        });
    });

    describe('delete', () => {
        it('should delete service order successfully', async () => {
            mockPostgresConnection.delete.mockResolvedValue(undefined);

            await serviceOrderGateway.delete(1);

            expect(mockPostgresConnection.delete).toHaveBeenCalledWith('service_orders', 1);
        });

        it('should handle database errors during delete', async () => {
            mockPostgresConnection.delete.mockRejectedValue(new Error('Database error'));

            await expect(serviceOrderGateway.delete(1)).rejects.toThrow('Database error');
        });
    });
});