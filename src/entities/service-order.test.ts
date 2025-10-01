import { ServiceOrder, ServiceOrderProps } from './service-order';
import { Service } from './service';
import { Supply } from './supply';
import { ServiceOrderStatus } from '../interfaces/enums/service-order-status.enum';
import { ValidationError } from '../usecases/errors/errors';

describe('ServiceOrder Entity', () => {
    const createMockService = () => new Service({
        name: 'Troca de óleo',
        description: 'Óleo sintético',
        price: 100
    });

    const createMockSupply = () => new Supply({
        name: 'Filtro de óleo',
        quantity: 1,
        price: 30
    });

    const createValidServiceOrderProps = (): ServiceOrderProps => ({
        clientId: 1,
        vehicleId: 1,
        services: [createMockService()],
        supplies: [createMockSupply()],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.RECEIVED
    });

    describe('Constructor', () => {
        it('should create service order with valid props', () => {
            const props = createValidServiceOrderProps();
            const serviceOrder = new ServiceOrder(props);

            expect(serviceOrder.clientId).toBe(1);
            expect(serviceOrder.vehicleId).toBe(1);
            expect(serviceOrder.services).toHaveLength(1);
            expect(serviceOrder.supplies).toHaveLength(1);
            expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED);
            expect(serviceOrder.id).toBeUndefined();
        });

        it('should create service order with id', () => {
            const props = createValidServiceOrderProps();
            const serviceOrder = new ServiceOrder(props, 1);

            expect(serviceOrder.id).toBe(1);
        });

        it('should throw ValidationError if clientId is missing', () => {
            const props = { ...createValidServiceOrderProps(), clientId: 0 };

            expect(() => new ServiceOrder(props)).toThrow(ValidationError);
            expect(() => new ServiceOrder(props)).toThrow('ID do cliente é obrigatório');
        });

        it('should throw ValidationError if vehicleId is missing', () => {
            const props = { ...createValidServiceOrderProps(), vehicleId: 0 };

            expect(() => new ServiceOrder(props)).toThrow(ValidationError);
            expect(() => new ServiceOrder(props)).toThrow('ID do veículo é obrigatório');
        });

        it('should throw ValidationError if services is empty', () => {
            const props = { ...createValidServiceOrderProps(), services: [] };

            expect(() => new ServiceOrder(props)).toThrow(ValidationError);
            expect(() => new ServiceOrder(props)).toThrow('Serviços são obrigatórios');
        });

        it('should throw ValidationError if services is null', () => {
            const props = { ...createValidServiceOrderProps(), services: null as any };

            expect(() => new ServiceOrder(props)).toThrow(ValidationError);
            expect(() => new ServiceOrder(props)).toThrow('Serviços são obrigatórios');
        });

        it('should throw ValidationError if createdAt is missing', () => {
            const props = { ...createValidServiceOrderProps(), createdAt: null as any };

            expect(() => new ServiceOrder(props)).toThrow(ValidationError);
            expect(() => new ServiceOrder(props)).toThrow('Data de criação é obrigatória');
        });

        it('should allow empty supplies array', () => {
            const props = { ...createValidServiceOrderProps(), supplies: [] };

            expect(() => new ServiceOrder(props)).not.toThrow();
        });
    });

    describe('Getters', () => {
        let serviceOrder: ServiceOrder;

        beforeEach(() => {
            serviceOrder = new ServiceOrder(createValidServiceOrderProps(), 1);
        });

        it('should return clientId', () => {
            expect(serviceOrder.clientId).toBe(1);
        });

        it('should return vehicleId', () => {
            expect(serviceOrder.vehicleId).toBe(1);
        });

        it('should return services', () => {
            expect(serviceOrder.services).toHaveLength(1);
            expect(serviceOrder.services[0].name).toBe('Troca de óleo');
        });

        it('should return supplies', () => {
            expect(serviceOrder.supplies).toHaveLength(1);
            expect(serviceOrder.supplies[0].name).toBe('Filtro de óleo');
        });

        it('should return createdAt', () => {
            expect(serviceOrder.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
        });

        it('should return finalizedAt', () => {
            expect(serviceOrder.finalizedAt).toBeNull();
        });

        it('should return status', () => {
            expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED);
        });
    });

    describe('totalServicePrice', () => {
        it('should calculate total price from services and supplies', () => {
            const serviceOrder = new ServiceOrder(createValidServiceOrderProps());

            expect(serviceOrder.totalServicePrice).toBe(130); // 100 + 30
        });

        it('should handle empty supplies array', () => {
            const props = { ...createValidServiceOrderProps(), supplies: [] };
            const serviceOrder = new ServiceOrder(props);

            expect(serviceOrder.totalServicePrice).toBe(100); // apenas serviços
        });

        it('should handle services with minimal price', () => {
            const serviceWithMinimalPrice = new Service({
                name: 'Inspeção básica',
                description: 'Inspeção visual',
                price: 0.01
            });
            const props = {
                ...createValidServiceOrderProps(),
                services: [serviceWithMinimalPrice],
                supplies: []
            };
            const serviceOrder = new ServiceOrder(props);

            expect(serviceOrder.totalServicePrice).toBe(0.01);
        });

        it('should handle multiple services and supplies', () => {
            const service2 = new Service({
                name: 'Alinhamento',
                description: 'Alinhamento de rodas',
                price: 80
            });
            const supply2 = new Supply({
                name: 'Balanceamento',
                quantity: 4,
                price: 20
            });
            const props = {
                ...createValidServiceOrderProps(),
                services: [createMockService(), service2],
                supplies: [createMockSupply(), supply2]
            };
            const serviceOrder = new ServiceOrder(props);

            expect(serviceOrder.totalServicePrice).toBe(230); // 100 + 80 + 30 + 20
        });
    });

    describe('Status transitions', () => {
        let serviceOrder: ServiceOrder;

        beforeEach(() => {
            serviceOrder = new ServiceOrder(createValidServiceOrderProps());
        });

        describe('startDiagnosis', () => {
            it('should change status from RECEIVED to IN_DIAGNOSIS', () => {
                serviceOrder.startDiagnosis();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
            });

            it('should throw error if status is not RECEIVED', () => {
                const props = { ...createValidServiceOrderProps(), status: ServiceOrderStatus.IN_PROGRESS };
                const so = new ServiceOrder(props);

                expect(() => so.startDiagnosis()).toThrow(ValidationError);
                expect(() => so.startDiagnosis()).toThrow('A ordem de serviço deve estar recebida para iniciar o diagnóstico');
            });
        });

        describe('updateServices', () => {
            it('should update services when in diagnosis', () => {
                serviceOrder.startDiagnosis();
                const newService = new Service({
                    name: 'Novo serviço',
                    description: 'Descrição',
                    price: 50
                });

                serviceOrder.updateServices([newService]);

                expect(serviceOrder.services).toEqual([newService]);
            });

            it('should throw error if not in diagnosis', () => {
                const newService = new Service({
                    name: 'Novo serviço',
                    description: 'Descrição',
                    price: 50
                });

                expect(() => serviceOrder.updateServices([newService])).toThrow(ValidationError);
                expect(() => serviceOrder.updateServices([newService])).toThrow('A ordem de serviço deve estar em diagnóstico para atualizar os serviços');
            });
        });

        describe('updateSupplies', () => {
            it('should update supplies when in diagnosis', () => {
                serviceOrder.startDiagnosis();
                const newSupply = new Supply({
                    name: 'Novo suprimento',
                    quantity: 2,
                    price: 40
                });

                serviceOrder.updateSupplies([newSupply]);

                expect(serviceOrder.supplies).toEqual([newSupply]);
            });

            it('should throw error if not in diagnosis', () => {
                const newSupply = new Supply({
                    name: 'Novo suprimento',
                    quantity: 2,
                    price: 40
                });

                expect(() => serviceOrder.updateSupplies([newSupply])).toThrow(ValidationError);
                expect(() => serviceOrder.updateSupplies([newSupply])).toThrow('A ordem de serviço deve estar em diagnóstico para atualizar os suprimentos');
            });
        });

        describe('submitForApproval', () => {
            it('should change status from IN_DIAGNOSIS to WAITING_FOR_APPROVAL', () => {
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.WAITING_FOR_APPROVAL);
            });

            it('should throw error if not in diagnosis', () => {
                expect(() => serviceOrder.submitForApproval()).toThrow(ValidationError);
                expect(() => serviceOrder.submitForApproval()).toThrow('A ordem de serviço deve estar em diagnóstico para ser submetida para aprovação');
            });
        });

        describe('approveOrder', () => {
            it('should change status from WAITING_FOR_APPROVAL to APPROVED', () => {
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();
                serviceOrder.approveOrder();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.APPROVED);
            });

            it('should throw error if not waiting for approval', () => {
                expect(() => serviceOrder.approveOrder()).toThrow(ValidationError);
                expect(() => serviceOrder.approveOrder()).toThrow('A ordem de serviço deve estar aguardando aprovação para ser aprovada');
            });
        });

        describe('startExecution', () => {
            it('should change status from APPROVED to IN_PROGRESS', () => {
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();
                serviceOrder.approveOrder();
                serviceOrder.startExecution();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_PROGRESS);
            });

            it('should throw error if not approved', () => {
                expect(() => serviceOrder.startExecution()).toThrow(ValidationError);
                expect(() => serviceOrder.startExecution()).toThrow('A ordem de serviço deve estar aprovada para iniciar a execução');
            });
        });

        describe('finalizeOrder', () => {
            it('should change status from IN_PROGRESS to FINISHED and set finalizedAt', () => {
                const beforeFinalize = new Date();
                
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();
                serviceOrder.approveOrder();
                serviceOrder.startExecution();
                serviceOrder.finalizeOrder();

                const afterFinalize = new Date();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.FINISHED);
                expect(serviceOrder.finalizedAt).toBeDefined();
                expect(serviceOrder.finalizedAt!.getTime()).toBeGreaterThanOrEqual(beforeFinalize.getTime());
                expect(serviceOrder.finalizedAt!.getTime()).toBeLessThanOrEqual(afterFinalize.getTime());
            });

            it('should throw error if not in progress', () => {
                expect(() => serviceOrder.finalizeOrder()).toThrow(ValidationError);
                expect(() => serviceOrder.finalizeOrder()).toThrow('A ordem de serviço deve estar em andamento para ser finalizada');
            });
        });

        describe('deliverOrder', () => {
            it('should change status from FINISHED to DELIVERED', () => {
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();
                serviceOrder.approveOrder();
                serviceOrder.startExecution();
                serviceOrder.finalizeOrder();
                serviceOrder.deliverOrder();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED);
            });

            it('should throw error if not finished', () => {
                expect(() => serviceOrder.deliverOrder()).toThrow(ValidationError);
                expect(() => serviceOrder.deliverOrder()).toThrow('A ordem de serviço deve estar finalizada para ser entregue');
            });
        });

        describe('cancelOrder', () => {
            it('should change status to CANCELLED and set finalizedAt', () => {
                const beforeCancel = new Date();
                
                serviceOrder.cancelOrder();
                
                const afterCancel = new Date();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED);
                expect(serviceOrder.finalizedAt).toBeDefined();
                expect(serviceOrder.finalizedAt!.getTime()).toBeGreaterThanOrEqual(beforeCancel.getTime());
                expect(serviceOrder.finalizedAt!.getTime()).toBeLessThanOrEqual(afterCancel.getTime());
            });

            it('should cancel from any status', () => {
                serviceOrder.startDiagnosis();
                serviceOrder.cancelOrder();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED);
            });
        });

        describe('rejectOrder', () => {
            it('should change status from WAITING_FOR_APPROVAL to CANCELLED', () => {
                const beforeReject = new Date();
                
                serviceOrder.startDiagnosis();
                serviceOrder.submitForApproval();
                serviceOrder.rejectOrder();
                
                const afterReject = new Date();

                expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED);
                expect(serviceOrder.finalizedAt).toBeDefined();
                expect(serviceOrder.finalizedAt!.getTime()).toBeGreaterThanOrEqual(beforeReject.getTime());
                expect(serviceOrder.finalizedAt!.getTime()).toBeLessThanOrEqual(afterReject.getTime());
            });

            it('should throw error if not waiting for approval', () => {
                expect(() => serviceOrder.rejectOrder()).toThrow(ValidationError);
                expect(() => serviceOrder.rejectOrder()).toThrow('A ordem de serviço deve estar aguardando aprovação para ser rejeitada');
            });
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            const props = createValidServiceOrderProps();
            const serviceOrder = new ServiceOrder(props, 1);
            
            const json = serviceOrder.toJSON();
            
            expect(json).toEqual({
                id: 1,
                clientId: 1,
                vehicleId: 1,
                services: props.services,
                supplies: props.supplies,
                createdAt: new Date('2024-01-01T10:00:00Z'),
                finalizedAt: null,
                status: ServiceOrderStatus.RECEIVED
            });
        });

        it('should include finalizedAt when set', () => {
            const serviceOrder = new ServiceOrder(createValidServiceOrderProps(), 1);
            serviceOrder.cancelOrder();
            
            const json = serviceOrder.toJSON();
            
            expect(json.finalizedAt).toBeDefined();
            expect(json.status).toBe(ServiceOrderStatus.CANCELLED);
        });
    });

    describe('Full workflow', () => {
        it('should complete full happy path workflow', () => {
            const serviceOrder = new ServiceOrder(createValidServiceOrderProps());

            // Workflow completo
            expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED);
            
            serviceOrder.startDiagnosis();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
            
            serviceOrder.submitForApproval();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.WAITING_FOR_APPROVAL);
            
            serviceOrder.approveOrder();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.APPROVED);
            
            serviceOrder.startExecution();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_PROGRESS);
            
            serviceOrder.finalizeOrder();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.FINISHED);
            expect(serviceOrder.finalizedAt).toBeDefined();
            
            serviceOrder.deliverOrder();
            expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED);
        });

        it('should handle rejection workflow', () => {
            const serviceOrder = new ServiceOrder(createValidServiceOrderProps());

            serviceOrder.startDiagnosis();
            serviceOrder.submitForApproval();
            serviceOrder.rejectOrder();

            expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED);
            expect(serviceOrder.finalizedAt).toBeDefined();
        });
    });
});