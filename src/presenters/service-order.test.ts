import { ServiceOrderPresenter } from './service-order';
import { ServiceOrder } from '../entities/service-order';
import { Service } from '../entities/service';
import { Supply } from '../entities/supply';
import { ServiceOrderStatus } from '../interfaces/enums/service-order-status.enum';

describe('ServiceOrderPresenter', () => {
    let presenter: ServiceOrderPresenter;

    beforeEach(() => {
        presenter = new ServiceOrderPresenter();
    });

    describe('present', () => {
        it('should present a service order correctly', () => {
            const service = new Service({
                name: 'Troca de óleo',
                description: 'Troca do óleo do motor',
                price: 100
            }, 1);

            const supply = new Supply({
                name: 'Óleo 5W30',
                price: 50,
                quantity: 2
            }, 1);

            const serviceOrder = new ServiceOrder({
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [supply],
                status: ServiceOrderStatus.RECEIVED,
                createdAt: new Date('2024-01-01T10:00:00Z'),
                finalizedAt: null
            }, 1);

            presenter.present(serviceOrder);

            expect(presenter.getStatusCode()).toBe(201);
            expect(presenter.getResponse()).toMatchObject({
                success: true,
                data: {
                    id: 1,
                    clientId: 1,
                    vehicleId: 1,
                    status: ServiceOrderStatus.RECEIVED,
                    services: expect.any(Array),
                    supplies: expect.any(Array)
                }
            });
        });
    });

    describe('presentList', () => {
        it('should present a list of service orders correctly', () => {
            const service1 = new Service({
                name: 'Troca de óleo',
                description: 'Troca do óleo do motor',
                price: 100
            }, 1);

            const serviceOrder1 = new ServiceOrder({
                clientId: 1,
                vehicleId: 1,
                services: [service1],
                supplies: [],
                status: ServiceOrderStatus.RECEIVED,
                createdAt: new Date('2024-01-01T10:00:00Z'),
                finalizedAt: null
            }, 1);

            const serviceOrder2 = new ServiceOrder({
                clientId: 2,
                vehicleId: 2,
                services: [service1],
                supplies: [],
                status: ServiceOrderStatus.IN_PROGRESS,
                createdAt: new Date('2024-01-02T10:00:00Z'),
                finalizedAt: null
            }, 2);

            presenter.presentList([serviceOrder1, serviceOrder2]);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toMatchObject({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        status: ServiceOrderStatus.RECEIVED
                    }),
                    expect.objectContaining({
                        id: 2,
                        status: ServiceOrderStatus.IN_PROGRESS
                    })
                ])
            });
        });

        it('should present an empty list correctly', () => {
            presenter.presentList([]);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: []
            });
        });
    });

    describe('presentUpdate', () => {
        it('should present an updated service order correctly', () => {
            const service = new Service({
                name: 'Troca de óleo',
                description: 'Troca do óleo do motor',
                price: 100
            }, 1);

            const serviceOrder = new ServiceOrder({
                clientId: 1,
                vehicleId: 1,
                services: [service],
                supplies: [],
                status: ServiceOrderStatus.IN_PROGRESS,
                createdAt: new Date('2024-01-01T10:00:00Z'),
                finalizedAt: null
            }, 1);

            presenter.presentUpdate(serviceOrder);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toMatchObject({
                success: true,
                data: {
                    id: 1,
                    status: ServiceOrderStatus.IN_PROGRESS,
                    totalServicePrice: 100
                }
            });
        });

        it('should present updated service order with DTO', () => {
            const serviceOrderDTO = {
                id: 1,
                clientId: 1,
                vehicleId: 1,
                services: [{ id: 1, name: 'Service', description: 'Test', price: 100 }],
                supplies: [{ id: 1, name: 'Supply', price: 50, quantity: 1 }],
                status: ServiceOrderStatus.APPROVED,
                createdAt: new Date('2024-01-01T10:00:00Z'),
                finalizedAt: null
            };

            presenter.presentUpdate(serviceOrderDTO);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toMatchObject({
                success: true,
                data: {
                    id: 1,
                    status: ServiceOrderStatus.APPROVED,
                    totalServicePrice: 150
                }
            });
        });
    });
});