import { ServiceOrderUseCases } from './service-order';
import { ServiceOrderGatewayInterface, ClientGatewayInterface, VehicleGatewayInterface } from '../interfaces/gateways';
import { ValidationError } from './errors/errors';

describe('ServiceOrderUseCases', () => {
    let serviceOrderUseCases: ServiceOrderUseCases;
    let mockServiceOrderGateway: jest.Mocked<ServiceOrderGatewayInterface>;
    let mockClientGateway: jest.Mocked<ClientGatewayInterface>;
    let mockVehicleGateway: jest.Mocked<VehicleGatewayInterface>;

    beforeEach(() => {
        mockServiceOrderGateway = {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllActiveWithOrdering: jest.fn(),
            findOpenOSByCarAndClient: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        mockClientGateway = {
            insert: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findByIdentifier: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        mockVehicleGateway = {
            insert: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findByLicensePlate: jest.fn(),
            findByClientId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        serviceOrderUseCases = new ServiceOrderUseCases(
            mockServiceOrderGateway,
            mockClientGateway,
            mockVehicleGateway
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createServiceOrder', () => {
        it('should throw ValidationError if client does not exist', async () => {
            const serviceOrderData = {
                clientId: 999,
                vehicleId: 1,
                services: [],
            };

            mockClientGateway.findById.mockResolvedValue(null);

            await expect(
                serviceOrderUseCases.createServiceOrder(serviceOrderData)
            ).rejects.toThrow(ValidationError);
            await expect(
                serviceOrderUseCases.createServiceOrder(serviceOrderData)
            ).rejects.toThrow('Cliente não encontrado');
        });

        it('should throw ValidationError if vehicle does not exist', async () => {
            const serviceOrderData = {
                clientId: 1,
                vehicleId: 999,
                services: [],
            };

            const mockClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
            mockClientGateway.findById.mockResolvedValue(mockClient);
            mockVehicleGateway.findById.mockResolvedValue(null);

            await expect(
                serviceOrderUseCases.createServiceOrder(serviceOrderData)
            ).rejects.toThrow(ValidationError);
            await expect(
                serviceOrderUseCases.createServiceOrder(serviceOrderData)
            ).rejects.toThrow('Veículo não encontrado');
        });
    });

    describe('findServiceOrderById', () => {
        it('should call gateway with correct id', async () => {
            const mockServiceOrderDTO = {
                id: 1,
                clientId: 1,
                vehicleId: 1,
                services: [{ id: 1, name: 'Service', description: 'Test service', price: 100 }],
                supplies: [],
                status: 'RECEIVED',
                createdAt: new Date(),
                finalizedAt: null
            };

            mockServiceOrderGateway.findById.mockResolvedValue(mockServiceOrderDTO);

            await serviceOrderUseCases.findServiceOrderById(1);

            expect(mockServiceOrderGateway.findById).toHaveBeenCalledWith(1);
        });
    });
});