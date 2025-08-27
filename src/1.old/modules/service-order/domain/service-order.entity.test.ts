import { ServiceOrder } from './service-order.entity';
import { ServiceOrderStatus } from '../../../shared/domain/enums/service-order-status.enum';
import { Service } from '../../service/domain/service.entity';
import { Supply } from '../../supply/domain/supply.entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

describe('ServiceOrder Entity', () => {
  let mockService: Service;
  let mockSupply: Supply;

  beforeEach(() => {
    mockService = new Service({
      name: 'Test Service',
      description: 'Test Description',
      price: 100
    }, 1);

    mockSupply = new Supply({
      name: 'Test Supply',
      quantity: 1,
      price: 50
    }, 1);
  });

  describe('constructor', () => {
    it('should create a service order with valid props', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(serviceOrder.clientId).toBe(1);
      expect(serviceOrder.vehicleId).toBe(1);
      expect(serviceOrder.services).toHaveLength(1);
      expect(serviceOrder.supplies).toHaveLength(1);
      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('should throw validation error when clientId is missing', () => {
      expect(() => {
        new ServiceOrder({
          clientId: 0,
          vehicleId: 1,
          services: [mockService],
          supplies: [mockSupply],
          status: ServiceOrderStatus.RECEIVED,
          createdAt: new Date(),
          finalizedAt: new Date(),
          totalServicePrice: 150
        });
      }).toThrow('ID do cliente é obrigatório');
    });

    it('should throw validation error when vehicleId is missing', () => {
      expect(() => {
        new ServiceOrder({
          clientId: 1,
          vehicleId: 0,
          services: [mockService],
          supplies: [mockSupply],
          status: ServiceOrderStatus.RECEIVED,
          createdAt: new Date(),
          finalizedAt: new Date(),
          totalServicePrice: 150
        });
      }).toThrow('ID do veículo é obrigatório');
    });

    it('should throw validation error when services are empty', () => {
      expect(() => {
        new ServiceOrder({
          clientId: 1,
          vehicleId: 1,
          services: [],
          supplies: [mockSupply],
          status: ServiceOrderStatus.RECEIVED,
          createdAt: new Date(),
          finalizedAt: new Date(),
          totalServicePrice: 150
        });
      }).toThrow('Serviços são obrigatórios');
    });

    it('should throw validation error when createdAt is missing', () => {
      expect(() => {
        new ServiceOrder({
          clientId: 1,
          vehicleId: 1,
          services: [mockService],
          supplies: [mockSupply],
          status: ServiceOrderStatus.RECEIVED,
          createdAt: null as any,
          finalizedAt: new Date(),
          totalServicePrice: 150
        });
      }).toThrow('Data de criação é obrigatória');
    });
  });

  describe('startDiagnosis', () => {
    it('should start diagnosis when status is RECEIVED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.startDiagnosis();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should throw error when status is not RECEIVED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.APPROVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.startDiagnosis()).toThrow(ValidationError);
    });
  });

  describe('updateServices', () => {
    it('should update services when status is IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      const newService = new Service({
        name: 'New Service',
        description: 'New Description',
        price: 200
      }, 2);

      serviceOrder.updateServices([newService]);

      expect(serviceOrder.services).toHaveLength(1);
      expect(serviceOrder.services[0].name).toBe('New Service');
    });

    it('should throw error when status is not IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.updateServices([mockService])).toThrow(ValidationError);
    });
  });

  describe('updateSupplies', () => {
    it('should update supplies when status is IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      const newSupply = new Supply({
        name: 'New Supply',
        quantity: 2,
        price: 75
      }, 2);

      serviceOrder.updateSupplies([newSupply]);

      expect(serviceOrder.supplies).toHaveLength(1);
      expect(serviceOrder.supplies[0].name).toBe('New Supply');
    });

    it('should throw error when status is not IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.updateSupplies([mockSupply])).toThrow(ValidationError);
    });
  });

  describe('submitForApproval', () => {
    it('should submit for approval when status is IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.submitForApproval();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.WAITING_FOR_APPROVAL);
    });

    it('should throw error when status is not IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.submitForApproval()).toThrow(ValidationError);
    });
  });

  describe('approveOrder', () => {
    it('should approve order when status is WAITING_FOR_APPROVAL', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.WAITING_FOR_APPROVAL,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.approveOrder();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.APPROVED);
    });

    it('should throw error when status is not WAITING_FOR_APPROVAL', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.approveOrder()).toThrow(ValidationError);
    });
  });

  describe('startExecution', () => {
    it('should start execution when status is APPROVED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.APPROVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.startExecution();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should throw error when status is not APPROVED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.startExecution()).toThrow(ValidationError);
    });
  });

  describe('finalizeOrder', () => {
    it('should finalize order when status is IN_PROGRESS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.IN_PROGRESS,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.finalizeOrder();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.FINISHED);
      expect(serviceOrder.finalizedAt).toBeInstanceOf(Date);
    });

    it('should throw error when status is not IN_PROGRESS', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.finalizeOrder()).toThrow(ValidationError);
    });
  });

  describe('deliverOrder', () => {
    it('should deliver order when status is FINISHED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.FINISHED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.deliverOrder();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED);
    });

    it('should throw error when status is not FINISHED', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      expect(() => serviceOrder.deliverOrder()).toThrow(ValidationError);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order regardless of status', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      serviceOrder.cancelOrder();

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const serviceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      }, 1);

      const json = serviceOrder.toJSON();

      expect(json.id).toBe(1);
      expect(json.clientId).toBe(1);
      expect(json.vehicleId).toBe(1);
      expect(json.services).toHaveLength(1);
      expect(json.supplies).toHaveLength(1);
      expect(json.status).toBe(ServiceOrderStatus.RECEIVED);
    });
  });
});
