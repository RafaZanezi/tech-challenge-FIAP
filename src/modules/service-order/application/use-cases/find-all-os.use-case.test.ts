import { ServiceOrderRepository } from '../../domain/service-order-repository.interface';
import { FindAllOSUseCase } from './find-all-os.use-case';
import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';
import { Service } from '../../../service/domain/service.entity';
import { ServiceOrder } from '../../domain/service-order.entity';

const mockServiceOrders: ServiceOrder[] = [
    new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [
            new Service({ name: 'Troca de óleo', description: 'Troca completa', price: 100 })
        ],
        supplies: [
            new (require('../../../supply/domain/supply.entity').Supply)({ name: 'Óleo', quantity: 1, price: 50 })
        ],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        finalizedAt: new Date('2024-01-02T10:00:00Z'),
        status: ServiceOrderStatus.FINISHED,
        totalServicePrice: 150
    }),
    new ServiceOrder({
        clientId: 2,
        vehicleId: 2,
        services: [
            new Service({ name: 'Lavagem', description: 'Lavagem completa', price: 50 })
        ],
        supplies: [],
        createdAt: new Date('2024-02-01T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.IN_PROGRESS,
        totalServicePrice: 50
    })
];

describe('FindAllOSUseCase', () => {
    let serviceOrderRepository: jest.Mocked<ServiceOrderRepository>;
    let useCase: FindAllOSUseCase;

    beforeEach(() => {
        serviceOrderRepository = {
            findAll: jest.fn()
        } as any;
        useCase = new FindAllOSUseCase(serviceOrderRepository);
    });

    it('should return all service orders mapped to FindOSResponse', async () => {
        serviceOrderRepository.findAll.mockResolvedValue(mockServiceOrders);

        const result = await useCase.execute();

        expect(serviceOrderRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            clientId: 1,
            vehicleId: 1,
            services: [{ name: 'Troca de óleo', description: 'Troca completa', price: 100 }],
            supplies: [{ name: 'Óleo', quantity: 1, price: 50 }],
            createdAt: new Date('2024-01-01T10:00:00Z'),
            finalizedAt: new Date('2024-01-02T10:00:00Z'),
            status: ServiceOrderStatus.FINISHED,
            totalPrice: 150
        });
    });

    it('should return empty array when no service orders exist', async () => {
        serviceOrderRepository.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('should handle service orders with multiple services', async () => {
        const multiServiceOrder = new ServiceOrder({
            clientId: 3,
            vehicleId: 3,
            services: [
                new Service({ name: 'Troca de óleo', description: 'Óleo sintético', price: 120 }),
                new Service({ name: 'Alinhamento', description: 'Alinhamento de rodas', price: 80 })
            ],
            supplies: [],
            createdAt: new Date('2024-03-01T10:00:00Z'),
            finalizedAt: undefined,
            status: ServiceOrderStatus.WAITING_FOR_APPROVAL,
            totalServicePrice: 200
        });

        serviceOrderRepository.findAll.mockResolvedValue([multiServiceOrder]);

        const result = await useCase.execute();

        expect(result[0].services).toHaveLength(2);
        expect(result[0].services[0]).toEqual({ name: 'Troca de óleo', description: 'Óleo sintético', price: 120 });
        expect(result[0].services[1]).toEqual({ name: 'Alinhamento', description: 'Alinhamento de rodas', price: 80 });
    });

    it('should handle service orders with multiple supplies', async () => {
        const Supply = require('../../../supply/domain/supply.entity').Supply;
        const multiSupplyOrder = new ServiceOrder({
            clientId: 4,
            vehicleId: 4,
            services: [
                new Service({ name: 'Manutenção', description: 'Manutenção geral', price: 100 })
            ],
            supplies: [
                new Supply({ name: 'Óleo', quantity: 2, price: 50 }),
                new Supply({ name: 'Filtro', quantity: 1, price: 30 })
            ],
            createdAt: new Date('2024-04-01T10:00:00Z'),
            finalizedAt: undefined,
            status: ServiceOrderStatus.WAITING_FOR_APPROVAL,
            totalServicePrice: 180
        });

        serviceOrderRepository.findAll.mockResolvedValue([multiSupplyOrder]);

        const result = await useCase.execute();

        expect(result[0].supplies).toHaveLength(2);
        expect(result[0].supplies[0]).toEqual({ name: 'Óleo', quantity: 2, price: 50 });
        expect(result[0].supplies[1]).toEqual({ name: 'Filtro', quantity: 1, price: 30 });
    });

    it('should handle service orders with different statuses', async () => {
        const pendingOrder = new ServiceOrder({
            clientId: 5,
            vehicleId: 5,
            services: [new Service({ name: 'Revisão', description: 'Revisão completa', price: 200 })],
            supplies: [],
            createdAt: new Date('2024-05-01T10:00:00Z'),
            finalizedAt: undefined,
            status: ServiceOrderStatus.WAITING_FOR_APPROVAL,
            totalServicePrice: 200
        });

        serviceOrderRepository.findAll.mockResolvedValue([pendingOrder]);

        const result = await useCase.execute();

        expect(result[0].status).toBe(ServiceOrderStatus.WAITING_FOR_APPROVAL);
        expect(result[0].finalizedAt).toBeUndefined();
    });

    it('should propagate errors from repository', async () => {
        serviceOrderRepository.findAll.mockRejectedValue(new Error('DB error'));

        await expect(useCase.execute()).rejects.toThrow('DB error');
    });

    it('should handle repository returning null or undefined gracefully', async () => {
        serviceOrderRepository.findAll.mockResolvedValue(null as any);

        await expect(useCase.execute()).rejects.toThrow();
    });

    it('should map service order properties correctly', async () => {
        const testOrder = new ServiceOrder({
            clientId: 999,
            vehicleId: 888,
            services: [new Service({ name: 'Test Service', description: 'Test Description', price: 123.45 })],
            supplies: [],
            createdAt: new Date('2024-12-01T15:30:00Z'),
            finalizedAt: new Date('2024-12-02T16:45:00Z'),
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: 123.45
        });

        serviceOrderRepository.findAll.mockResolvedValue([testOrder]);

        const result = await useCase.execute();

        expect(result[0].clientId).toBe(999);
        expect(result[0].vehicleId).toBe(888);
        expect(result[0].createdAt).toEqual(new Date('2024-12-01T15:30:00Z'));
        expect(result[0].finalizedAt).toEqual(new Date('2024-12-02T16:45:00Z'));
        expect(result[0].totalPrice).toBe(123.45);
    });
});