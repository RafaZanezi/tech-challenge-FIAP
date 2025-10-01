import { ServiceGateway } from './service';
import { Service } from '../entities/service';
import { DatabaseConnection } from '../interfaces/connection';
import { PostgresConnection } from '../external/postgres/database-queries';

// Mock da PostgresConnection
jest.mock('../external/postgres/database-queries');

describe('ServiceGateway', () => {
    let serviceGateway: ServiceGateway;
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

        serviceGateway = new ServiceGateway(mockDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should call findAll with correct table name', async () => {
            const mockServices = [
                { id: 1, name: 'Troca de óleo', description: 'Serviço de troca de óleo', price: 50.00 },
                { id: 2, name: 'Alinhamento', description: 'Alinhamento das rodas', price: 80.00 }
            ];

            mockPostgresConnection.findAll.mockResolvedValue(mockServices);

            const result = await serviceGateway.findAll();

            expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('services', null);
            expect(result).toEqual(mockServices);
        });

        it('should return empty array when no services found', async () => {
            mockPostgresConnection.findAll.mockResolvedValue([]);

            const result = await serviceGateway.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should call findByParams with correct parameters', async () => {
            const mockService = { id: 1, name: 'Troca de óleo', description: 'Serviço de troca de óleo', price: 50.00 };
            const serviceId = 1;

            mockPostgresConnection.findByParams.mockResolvedValue(mockService);

            const result = await serviceGateway.findById(serviceId);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('services', null, { id: serviceId });
            expect(result).toEqual(mockService);
        });

        it('should return null when service not found', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await serviceGateway.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByName', () => {
        it('should call findByParams with correct parameters', async () => {
            const mockService = { id: 1, name: 'Troca de óleo', description: 'Serviço de troca de óleo', price: 50.00 };
            const serviceName = 'Troca de óleo';

            mockPostgresConnection.findByParams.mockResolvedValue(mockService);

            const result = await serviceGateway.findByName(serviceName);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('services', null, { name: serviceName });
            expect(result).toEqual(mockService);
        });

        it('should return null when service not found by name', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await serviceGateway.findByName('Serviço inexistente');

            expect(result).toBeNull();
        });
    });

    describe('insert', () => {
        it('should call insert with correct parameters', async () => {
            const service = new Service({
                name: 'Troca de óleo',
                description: 'Serviço de troca de óleo',
                price: 50.00
            });

            const mockInsertedService = { id: 1, name: 'Troca de óleo', description: 'Serviço de troca de óleo', price: 50.00 };

            mockPostgresConnection.insert.mockResolvedValue(mockInsertedService);

            const result = await serviceGateway.insert(service);

            expect(mockPostgresConnection.insert).toHaveBeenCalledWith('services', service);
            expect(result).toEqual(mockInsertedService);
        });
    });

    describe('update', () => {
        it('should call update with correct parameters', async () => {
            const serviceId = 1;
            const updateData = { name: 'Novo nome do serviço', price: 60.00 };
            const mockUpdatedService = { id: 1, name: 'Novo nome do serviço', description: 'Descrição existente', price: 60.00 };

            mockPostgresConnection.update.mockResolvedValue(mockUpdatedService);

            const result = await serviceGateway.update(serviceId, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('services', serviceId, updateData);
            expect(result).toEqual(mockUpdatedService);
        });

        it('should handle partial updates', async () => {
            const serviceId = 1;
            const updateData = { price: 75.00 };
            const mockUpdatedService = { id: 1, name: 'Troca de óleo', description: 'Descrição existente', price: 75.00 };

            mockPostgresConnection.update.mockResolvedValue(mockUpdatedService);

            const result = await serviceGateway.update(serviceId, updateData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('services', serviceId, updateData);
            expect(result).toEqual(mockUpdatedService);
        });
    });

    describe('delete', () => {
        it('should call delete with correct parameters', async () => {
            const serviceId = 1;

            mockPostgresConnection.delete.mockResolvedValue(undefined);

            await serviceGateway.delete(serviceId);

            expect(mockPostgresConnection.delete).toHaveBeenCalledWith('services', serviceId);
        });
    });

    describe('constructor', () => {
        it('should initialize with correct table name', () => {
            expect(serviceGateway).toBeInstanceOf(ServiceGateway);
            expect(PostgresConnection).toHaveBeenCalledWith(mockDatabase);
        });
    });
});