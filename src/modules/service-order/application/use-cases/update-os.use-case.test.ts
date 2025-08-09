import { UpdateOSUseCase } from './update-os.use-case';
import { ServiceOrderRepository } from '../../domain/service-order-repository.interface';
import { ServiceOrder } from '../../domain/service-order.entity';
import { UpdateServiceOrderStatusRequest } from '../dtos/update-status-os';
import { Service } from '../../../service/domain/service.entity';
import { Supply } from '../../../supply/domain/supply.entity';
import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';

describe('UpdateOSUseCase', () => {
    let serviceOrderRepository: jest.Mocked<ServiceOrderRepository>;
    let updateOSUseCase: UpdateOSUseCase;

    const mockServiceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 2,
        services: [new Service({ name: 'Troca de óleo', description: 'Troca completa', price: 100 }, 1)],
        supplies: [new Supply({ name: 'Óleo', price: 50, quantity: 1 }, 2)],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.IN_PROGRESS,
        totalServicePrice: 150,
    }, 1);

    beforeEach(() => {
        serviceOrderRepository = {
            findById: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOpenOSByCarAndClient: jest.fn(),
        } as any;
        updateOSUseCase = new UpdateOSUseCase(serviceOrderRepository);
    });

    it('should update the status of an existing service order', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: new Date('2024-01-02T12:00:00Z'),
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: new Date('2024-01-02T12:00:00Z'),
        };

        const response = await updateOSUseCase.execute(request);

        expect(serviceOrderRepository.findById).toHaveBeenCalledWith(1);
        expect(serviceOrderRepository.update).toHaveBeenCalledWith(1, expect.any(ServiceOrder));
        expect(response).toEqual({
            id: 1,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: request.finishedAt,
            status: ServiceOrderStatus.FINISHED,
        });
    });

    it('should throw an error if service order does not exist', async () => {
        serviceOrderRepository.findById.mockResolvedValue(null);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: new Date(),
        };

        await expect(updateOSUseCase.execute(request)).rejects.toThrow(
            'Ordem de serviço com ID 1 não encontrada.'
        );
        expect(serviceOrderRepository.findById).toHaveBeenCalledWith(1);
        expect(serviceOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should preserve finalizedAt if not provided in request', async () => {
        const existingDate = new Date('2024-01-03T15:00:00Z');
        const serviceOrderWithFinalizedAt = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: existingDate,
            status: mockServiceOrder.status,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: existingDate,
            status: ServiceOrderStatus.IN_PROGRESS,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(serviceOrderWithFinalizedAt);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.IN_PROGRESS,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.finalizedAt).toEqual(existingDate);
        expect(response.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should preserve totalServicePrice after update', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: new Date(),
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: new Date(),
        };

        await updateOSUseCase.execute(request);

        const updatedOrder = serviceOrderRepository.update.mock.calls[0][1];
        expect(updatedOrder.totalServicePrice).toBe(mockServiceOrder.totalServicePrice);
    });

    it('should update status to CANCELLED', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: ServiceOrderStatus.CANCELLED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.CANCELLED,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.status).toBe(ServiceOrderStatus.CANCELLED);
        expect(serviceOrderRepository.update).toHaveBeenCalledWith(1, expect.any(ServiceOrder));
    });

    it('should handle repository errors gracefully', async () => {
        serviceOrderRepository.findById.mockRejectedValue(new Error('Database connection failed'));

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
        };

        await expect(updateOSUseCase.execute(request)).rejects.toThrow('Database connection failed');
        expect(serviceOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should handle update repository errors', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockRejectedValue(new Error('Update failed'));

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
        };

        await expect(updateOSUseCase.execute(request)).rejects.toThrow('Update failed');
    });

    it('should preserve all original service order properties', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
        };

        await updateOSUseCase.execute(request);

        const updatedOrder = serviceOrderRepository.update.mock.calls[0][1];
        expect(updatedOrder.clientId).toBe(mockServiceOrder.clientId);
        expect(updatedOrder.vehicleId).toBe(mockServiceOrder.vehicleId);
        expect(updatedOrder.services).toEqual(mockServiceOrder.services);
        expect(updatedOrder.supplies).toEqual(mockServiceOrder.supplies);
        expect(updatedOrder.createdAt).toEqual(mockServiceOrder.createdAt);
    });

    it('should handle null finishedAt in request', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: null,
            status: ServiceOrderStatus.IN_PROGRESS,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.IN_PROGRESS,
            finishedAt: undefined,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.finalizedAt).toBeNull();
        expect(response.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should update with different status values', async () => {
        const testCases = [
            ServiceOrderStatus.WAITING_FOR_APPROVAL,
            ServiceOrderStatus.IN_PROGRESS,
            ServiceOrderStatus.FINISHED,
            ServiceOrderStatus.CANCELLED
        ];

        for (const status of testCases) {
            const updatedServiceOrder = new ServiceOrder({
                clientId: mockServiceOrder.clientId,
                vehicleId: mockServiceOrder.vehicleId,
                services: mockServiceOrder.services,
                supplies: mockServiceOrder.supplies,
                createdAt: mockServiceOrder.createdAt,
                finalizedAt: mockServiceOrder.finalizedAt,
                status,
                totalServicePrice: mockServiceOrder.totalServicePrice,
            }, 1);

            serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
            serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

            const request: UpdateServiceOrderStatusRequest = {
                id: 1,
                status,
            };

            const response = await updateOSUseCase.execute(request);
            expect(response.status).toBe(status);
        }
    });

    it('should handle service order with existing finalizedAt when overriding', async () => {
        const existingDate = new Date('2024-01-03T15:00:00Z');
        const newDate = new Date('2024-01-04T10:00:00Z');
        
        const serviceOrderWithFinalizedAt = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: existingDate,
            status: mockServiceOrder.status,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: newDate,
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(serviceOrderWithFinalizedAt);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: newDate,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.finalizedAt).toEqual(newDate);
        expect(response.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('should handle status update with proper response mapping', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: new Date('2024-01-02T12:00:00Z'),
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: new Date('2024-01-02T12:00:00Z'),
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.status).toBe(ServiceOrderStatus.FINISHED);
        expect(response.createdAt).toBeDefined();
        expect(response.finalizedAt).toBeDefined();
        expect(response.id).toBe(1);
    });

    it('should handle null finalizedAt in response', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: null,
            status: ServiceOrderStatus.IN_PROGRESS,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.IN_PROGRESS,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.finalizedAt).toBeNull();
        expect(response.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should validate repository update is called with correct parameters', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: ServiceOrderStatus.CANCELLED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.CANCELLED,
        };

        await updateOSUseCase.execute(request);

        expect(serviceOrderRepository.update).toHaveBeenCalledTimes(1);
        expect(serviceOrderRepository.update).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: ServiceOrderStatus.CANCELLED,
                clientId: mockServiceOrder.clientId,
                vehicleId: mockServiceOrder.vehicleId,
            })
        );
    });

    it('should handle concurrent updates gracefully', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const requests = [
            { id: 1, status: ServiceOrderStatus.FINISHED },
            { id: 1, status: ServiceOrderStatus.CANCELLED },
        ];

        const responses = await Promise.all(
            requests.map(req => updateOSUseCase.execute(req))
        );

        expect(responses).toHaveLength(2);
        expect(serviceOrderRepository.findById).toHaveBeenCalledTimes(2);
        expect(serviceOrderRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should override finishedAt when provided in request', async () => {
        const existingDate = new Date('2024-01-03T15:00:00Z');
        const newDate = new Date('2024-01-04T10:00:00Z');
        
        const serviceOrderWithFinalizedAt = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: existingDate,
            status: mockServiceOrder.status,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: newDate,
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(serviceOrderWithFinalizedAt);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: newDate,
        };

        const response = await updateOSUseCase.execute(request);

        expect(response.finalizedAt).toEqual(newDate);
        expect(response.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('should preserve all entity properties during update', async () => {
        const updatedServiceOrder = new ServiceOrder({
            clientId: mockServiceOrder.clientId,
            vehicleId: mockServiceOrder.vehicleId,
            services: mockServiceOrder.services,
            supplies: mockServiceOrder.supplies,
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: ServiceOrderStatus.FINISHED,
            totalServicePrice: mockServiceOrder.totalServicePrice,
        }, 1);

        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        serviceOrderRepository.update.mockResolvedValue(updatedServiceOrder);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
        };

        await updateOSUseCase.execute(request);

        const updatedOrder = serviceOrderRepository.update.mock.calls[0][1];
        expect(updatedOrder.clientId).toBe(mockServiceOrder.clientId);
        expect(updatedOrder.vehicleId).toBe(mockServiceOrder.vehicleId);
        expect(updatedOrder.services).toEqual(mockServiceOrder.services);
        expect(updatedOrder.supplies).toEqual(mockServiceOrder.supplies);
        expect(updatedOrder.createdAt).toEqual(mockServiceOrder.createdAt);
    });

    it('integration: should update service order in repository', async () => {
        const db: Record<number, ServiceOrder> = {
            1: new ServiceOrder(mockServiceOrder, 1),
        };
        const repo: ServiceOrderRepository = {
            findById: async (id: number) => db[id] || null,
            update: async (id: number, order: ServiceOrder) => {
                const updatedOrder = new ServiceOrder(
                    {
                        clientId: order.clientId,
                        vehicleId: order.vehicleId,
                        services: order.services,
                        supplies: order.supplies,
                        createdAt: order.createdAt,
                        finalizedAt: order.finalizedAt,
                        status: order.status,
                        totalServicePrice: order.totalServicePrice,
                    },
                    id
                );
                db[id] = updatedOrder;
                return updatedOrder;
            },
            create: function (data: any): Promise<ServiceOrder> {
                throw new Error('Function not implemented.');
            },
            findAll: function (): Promise<ServiceOrder[]> {
                throw new Error('Function not implemented.');
            },
            findOpenOSByCarAndClient: function (carId: number, client: string): Promise<ServiceOrder[]> {
                throw new Error('Function not implemented.');
            }
        };
        const useCase = new UpdateOSUseCase(repo);

        const request: UpdateServiceOrderStatusRequest = {
            id: 1,
            status: ServiceOrderStatus.FINISHED,
            finishedAt: new Date('2024-01-05T10:00:00Z'),
        };

        const response = await useCase.execute(request);

        expect(response.status).toBe(ServiceOrderStatus.FINISHED);
        expect(db[1].status).toBe(ServiceOrderStatus.FINISHED);
        expect(db[1].finalizedAt).toEqual(request.finishedAt);
    });
});