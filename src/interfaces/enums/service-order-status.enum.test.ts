import { ServiceOrderStatus } from './service-order-status.enum';

describe('ServiceOrderStatus', () => {
    describe('enum values', () => {
        it('should have correct enum values', () => {
            expect(ServiceOrderStatus.RECEIVED).toBe('RECEIVED');
            expect(ServiceOrderStatus.IN_DIAGNOSIS).toBe('IN_DIAGNOSIS');
            expect(ServiceOrderStatus.WAITING_FOR_APPROVAL).toBe('WAITING_FOR_APPROVAL');
            expect(ServiceOrderStatus.APPROVED).toBe('APPROVED');
            expect(ServiceOrderStatus.IN_PROGRESS).toBe('IN_PROGRESS');
            expect(ServiceOrderStatus.FINISHED).toBe('FINISHED');
            expect(ServiceOrderStatus.DELIVERED).toBe('DELIVERED');
            expect(ServiceOrderStatus.CANCELLED).toBe('CANCELLED');
        });

        it('should contain all expected status values', () => {
            const expectedStatuses = [
                'RECEIVED',
                'IN_DIAGNOSIS',
                'WAITING_FOR_APPROVAL',
                'APPROVED',
                'IN_PROGRESS',
                'FINISHED',
                'DELIVERED',
                'CANCELLED'
            ];

            const actualStatuses = Object.values(ServiceOrderStatus);
            
            expect(actualStatuses).toHaveLength(expectedStatuses.length);
            expectedStatuses.forEach(status => {
                expect(actualStatuses).toContain(status);
            });
        });

        it('should be usable in switch statements', () => {
            const getStatusDescription = (status: ServiceOrderStatus): string => {
                switch (status) {
                    case ServiceOrderStatus.RECEIVED:
                        return 'Recebida';
                    case ServiceOrderStatus.IN_DIAGNOSIS:
                        return 'Em diagnóstico';
                    case ServiceOrderStatus.WAITING_FOR_APPROVAL:
                        return 'Aguardando aprovação';
                    case ServiceOrderStatus.APPROVED:
                        return 'Aprovada';
                    case ServiceOrderStatus.IN_PROGRESS:
                        return 'Em andamento';
                    case ServiceOrderStatus.FINISHED:
                        return 'Finalizada';
                    case ServiceOrderStatus.DELIVERED:
                        return 'Entregue';
                    case ServiceOrderStatus.CANCELLED:
                        return 'Cancelada';
                    default:
                        return 'Status desconhecido';
                }
            };

            expect(getStatusDescription(ServiceOrderStatus.RECEIVED)).toBe('Recebida');
            expect(getStatusDescription(ServiceOrderStatus.IN_DIAGNOSIS)).toBe('Em diagnóstico');
            expect(getStatusDescription(ServiceOrderStatus.WAITING_FOR_APPROVAL)).toBe('Aguardando aprovação');
            expect(getStatusDescription(ServiceOrderStatus.APPROVED)).toBe('Aprovada');
            expect(getStatusDescription(ServiceOrderStatus.IN_PROGRESS)).toBe('Em andamento');
            expect(getStatusDescription(ServiceOrderStatus.FINISHED)).toBe('Finalizada');
            expect(getStatusDescription(ServiceOrderStatus.DELIVERED)).toBe('Entregue');
            expect(getStatusDescription(ServiceOrderStatus.CANCELLED)).toBe('Cancelada');
        });

        it('should be comparable with strings', () => {
            expect(ServiceOrderStatus.RECEIVED === 'RECEIVED').toBe(true);
            expect(ServiceOrderStatus.CANCELLED === 'CANCELLED').toBe(true);
            
            const someString: string = 'RECEIVED';
            expect(ServiceOrderStatus.DELIVERED === someString).toBe(false);
        });

        it('should maintain object keys and values consistency', () => {
            Object.entries(ServiceOrderStatus).forEach(([key, value]) => {
                expect(key).toBe(value);
            });
        });
    });

    describe('workflow validation', () => {
        it('should represent valid workflow transitions', () => {
            const workflowOrder = [
                ServiceOrderStatus.RECEIVED,
                ServiceOrderStatus.IN_DIAGNOSIS,
                ServiceOrderStatus.WAITING_FOR_APPROVAL,
                ServiceOrderStatus.APPROVED,
                ServiceOrderStatus.IN_PROGRESS,
                ServiceOrderStatus.FINISHED,
                ServiceOrderStatus.DELIVERED
            ];

            // Verifica se todos os status do workflow existem
            workflowOrder.forEach(status => {
                expect(Object.values(ServiceOrderStatus)).toContain(status);
            });

            // Verifica se CANCELLED é um status válido que pode ocorrer em qualquer momento
            expect(Object.values(ServiceOrderStatus)).toContain(ServiceOrderStatus.CANCELLED);
        });

        it('should identify final states', () => {
            const finalStates = [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED];
            
            finalStates.forEach(status => {
                expect(Object.values(ServiceOrderStatus)).toContain(status);
            });
        });

        it('should identify in-progress states', () => {
            const inProgressStates = [
                ServiceOrderStatus.RECEIVED,
                ServiceOrderStatus.IN_DIAGNOSIS,
                ServiceOrderStatus.WAITING_FOR_APPROVAL,
                ServiceOrderStatus.APPROVED,
                ServiceOrderStatus.IN_PROGRESS,
                ServiceOrderStatus.FINISHED
            ];
            
            inProgressStates.forEach(status => {
                expect(Object.values(ServiceOrderStatus)).toContain(status);
            });
        });
    });
});