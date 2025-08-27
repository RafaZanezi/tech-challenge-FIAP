import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { ServiceOrder } from '../../domain/service-order.entity';
import { CreateOSUseCase } from './create-os.use-case';

const mockServiceOrderRepository = {
    findOpenOSByCarAndClient: jest.fn(),
    create: jest.fn(),
};
const mockClientRepository = {
    findByIdentifier: jest.fn(),
};

const mockRequest = {
    id: 1,
    client: '123',
    vehicleId: 456,
    services: [1, 2],
    supplies: [1, 2],
};

const mockClient = { id: 123 };
const mockServiceOrder = new ServiceOrder({
    clientId: mockClient.id,
    vehicleId: mockRequest.vehicleId,
    services: [{ id: 1 } as any, { id: 2 }],
    supplies: [{ id: 1 } as any, { id: 2 }],
    createdAt: new Date(),
    finalizedAt: null,
    status: ServiceOrderStatus.RECEIVED,
    totalServicePrice: 0,
});
const mockSavedServiceOrder = {
    ...mockServiceOrder,
    id: 'os-123',
    clientId: mockServiceOrder.clientId,
    vehicleId: mockServiceOrder.vehicleId,
    services: mockServiceOrder.services,
    supplies: mockServiceOrder.supplies,
    createdAt: mockServiceOrder.createdAt,
    finalizedAt: mockServiceOrder.finalizedAt,
    status: mockServiceOrder.status,
};

describe('CreateOSUseCase', () => {
    let useCase: CreateOSUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateOSUseCase(
            mockServiceOrderRepository as any,
            mockClientRepository as any
        );
    });

    it('should throw ConflictError if there is already an open OS for the vehicle and client', async () => {
        mockServiceOrderRepository.findOpenOSByCarAndClient.mockResolvedValue(mockServiceOrder);

        await expect(useCase.execute(mockRequest)).rejects.toThrow(ConflictError);
        expect(mockServiceOrderRepository.findOpenOSByCarAndClient).toHaveBeenCalledWith(
            mockRequest.vehicleId,
            mockRequest.client
        );
    });

    it('should throw ConflictError if client is not found', async () => {
        mockServiceOrderRepository.findOpenOSByCarAndClient.mockResolvedValue(null);
        mockClientRepository.findByIdentifier.mockResolvedValue(null);

        await expect(useCase.execute(mockRequest)).rejects.toThrow(ConflictError);
        expect(mockClientRepository.findByIdentifier).toHaveBeenCalledWith(mockRequest.client);
    });

    it('should create a new service order and return its data', async () => {
        mockServiceOrderRepository.findOpenOSByCarAndClient.mockResolvedValue(null);
        mockClientRepository.findByIdentifier.mockResolvedValue(mockClient);
        mockServiceOrderRepository.create.mockResolvedValue(mockSavedServiceOrder);

        const result = await useCase.execute(mockRequest);

        expect(mockServiceOrderRepository.create).toHaveBeenCalled();
        expect(result).toEqual({
            id: mockSavedServiceOrder.id,
            clientId: mockSavedServiceOrder.clientId,
            vehicleId: mockSavedServiceOrder.vehicleId,
            services: mockSavedServiceOrder.services,
            supplies: mockSavedServiceOrder.supplies,
            createdAt: mockSavedServiceOrder.createdAt,
            finalizedAt: mockSavedServiceOrder.finalizedAt,
            status: mockSavedServiceOrder.status,
        });
    });

    it('should set totalServicePrice to 0 and status to RECEIVED on creation', async () => {
        mockServiceOrderRepository.findOpenOSByCarAndClient.mockResolvedValue(null);
        mockClientRepository.findByIdentifier.mockResolvedValue(mockClient);
        mockServiceOrderRepository.create.mockImplementation((so: ServiceOrder) => {
            expect(so.totalServicePrice).toBe(0);
            expect(so.status).toBe(ServiceOrderStatus.RECEIVED);
            return { ...so, id: 'os-123' };
        });

        await useCase.execute(mockRequest);
    });

    it('should map services and supplies ids correctly', async () => {
        mockServiceOrderRepository.findOpenOSByCarAndClient.mockResolvedValue(null);
        mockClientRepository.findByIdentifier.mockResolvedValue(mockClient);
        mockServiceOrderRepository.create.mockImplementation((so: ServiceOrder) => {
            expect(so.services).toEqual([{ id: 1 }, { id: 2 }]);
            expect(so.supplies).toEqual([{ id: 1 }, { id: 2 }]);
            return { ...so, id: 'os-123' };
        });

        await useCase.execute(mockRequest);
    });
});