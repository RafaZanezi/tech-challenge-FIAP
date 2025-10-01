import { ServiceOrderAdapter } from './service-order-adapter';
import { ServiceOrderDTO } from '../dtos/service-order';
import { ServiceOrder } from '../entities/service-order';
import { Service } from '../entities/service';
import { Supply } from '../entities/supply';
import { ServiceOrderStatus } from '../interfaces/enums/service-order-status.enum';

describe('ServiceOrderAdapter', () => {
  describe('adapt', () => {
    it('should adapt ServiceOrderDTO to ServiceOrder entity', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        services: [
          {
            id: 1,
            name: 'Troca de óleo',
            description: 'Troca completa do óleo do motor',
            price: 80.00
          },
          {
            id: 2,
            name: 'Alinhamento',
            description: 'Alinhamento das rodas dianteiras',
            price: 50.00
          }
        ],
        supplies: [
          {
            id: 1,
            name: 'Óleo 5W30',
            quantity: 4,
            price: 25.00
          },
          {
            id: 2,
            name: 'Filtro de óleo',
            quantity: 1,
            price: 15.00
          }
        ],
        createdAt: new Date('2023-01-15T10:00:00Z'),
        finalizedAt: new Date('2023-01-15T12:00:00Z'),
        status: ServiceOrderStatus.FINISHED
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.id).toBe(1);
      expect(result.clientId).toBe(1);
      expect(result.vehicleId).toBe(1);
      expect(result.createdAt).toEqual(new Date('2023-01-15T10:00:00Z'));
      expect(result.finalizedAt).toEqual(new Date('2023-01-15T12:00:00Z'));
      expect(result.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('should adapt services correctly', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        services: [
          {
            id: 1,
            name: 'Revisão completa',
            description: 'Revisão dos 10.000 km',
            price: 200.00
          }
        ],
        supplies: [],
        createdAt: new Date('2023-01-15T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.IN_PROGRESS
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toBeInstanceOf(Service);
      expect(result.services[0].id).toBe(1);
      expect(result.services[0].name).toBe('Revisão completa');
      expect(result.services[0].description).toBe('Revisão dos 10.000 km');
      expect(result.services[0].price).toBe(200.00);
    });

    it('should adapt supplies correctly', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        services: [
          {
            id: 1,
            name: 'Troca de freios',
            description: 'Troca completa do sistema de freios',
            price: 150.00
          }
        ],
        supplies: [
          {
            id: 1,
            name: 'Pastilha de freio',
            quantity: 4,
            price: 85.00
          },
          {
            id: 2,
            name: 'Disco de freio',
            quantity: 2,
            price: 120.00
          }
        ],
        createdAt: new Date('2023-01-15T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.RECEIVED
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      expect(result.supplies).toHaveLength(2);
      expect(result.supplies[0]).toBeInstanceOf(Supply);
      expect(result.supplies[0].id).toBe(1);
      expect(result.supplies[0].name).toBe('Pastilha de freio');
      expect(result.supplies[0].quantity).toBe(4);
      expect(result.supplies[0].price).toBe(85.00);

      expect(result.supplies[1]).toBeInstanceOf(Supply);
      expect(result.supplies[1].id).toBe(2);
      expect(result.supplies[1].name).toBe('Disco de freio');
      expect(result.supplies[1].quantity).toBe(2);
      expect(result.supplies[1].price).toBe(120.00);
    });

    it('should handle empty supplies array with at least one service', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        services: [
          {
            id: 1,
            name: 'Revisão básica',
            description: 'Revisão básica do veículo',
            price: 80.00
          }
        ],
        supplies: [],
        createdAt: new Date('2023-01-15T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.RECEIVED
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      expect(result.services).toHaveLength(1);
      expect(result.supplies).toHaveLength(0);
      expect(result.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('should handle null finalizedAt date', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        services: [
          {
            id: 1,
            name: 'Serviço em andamento',
            description: 'Serviço sendo executado',
            price: 100.00
          }
        ],
        supplies: [],
        createdAt: new Date('2023-01-15T10:00:00Z'),
        finalizedAt: null,
        status: ServiceOrderStatus.IN_PROGRESS
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      expect(result.finalizedAt).toBeNull();
      expect(result.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should handle different service order statuses', () => {
      const testCases = [
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.FINISHED,
        ServiceOrderStatus.CANCELLED
      ];

      testCases.forEach(status => {
        const serviceOrderDTO: ServiceOrderDTO = {
          id: 1,
          clientId: 1,
          vehicleId: 1,
          services: [
            {
              id: 1,
              name: 'Serviço de teste',
              description: 'Serviço para teste de status',
              price: 50.00
            }
          ],
          supplies: [],
          createdAt: new Date('2023-01-15T10:00:00Z'),
          finalizedAt: status === ServiceOrderStatus.FINISHED ? new Date('2023-01-15T12:00:00Z') : null,
          status
        };

        const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

        expect(result.status).toBe(status);
      });
    });

    it('should preserve all DTO properties in adapted entity', () => {
      const serviceOrderDTO: ServiceOrderDTO = {
        id: 999,
        clientId: 123,
        vehicleId: 456,
        services: [
          {
            id: 10,
            name: 'Serviço teste',
            description: 'Descrição do serviço teste',
            price: 99.99
          }
        ],
        supplies: [
          {
            id: 20,
            name: 'Insumo teste',
            quantity: 3,
            price: 33.33
          }
        ],
        createdAt: new Date('2023-12-25T09:30:00Z'),
        finalizedAt: new Date('2023-12-25T11:45:00Z'),
        status: ServiceOrderStatus.FINISHED
      };

      const result = ServiceOrderAdapter.adapt(serviceOrderDTO);

      // Verify main properties
      expect(result.id).toBe(999);
      expect(result.clientId).toBe(123);
      expect(result.vehicleId).toBe(456);
      expect(result.createdAt).toEqual(new Date('2023-12-25T09:30:00Z'));
      expect(result.finalizedAt).toEqual(new Date('2023-12-25T11:45:00Z'));
      expect(result.status).toBe(ServiceOrderStatus.FINISHED);

      // Verify service properties
      expect(result.services[0].id).toBe(10);
      expect(result.services[0].name).toBe('Serviço teste');
      expect(result.services[0].description).toBe('Descrição do serviço teste');
      expect(result.services[0].price).toBe(99.99);

      // Verify supply properties
      expect(result.supplies[0].id).toBe(20);
      expect(result.supplies[0].name).toBe('Insumo teste');
      expect(result.supplies[0].quantity).toBe(3);
      expect(result.supplies[0].price).toBe(33.33);
    });
  });
});