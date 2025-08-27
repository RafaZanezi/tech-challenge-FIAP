import { PostgresServiceOrderRepository } from './postgres-service-order.repository';
import { ServiceOrder } from '../../domain/service-order.entity';
import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';
import { Service } from '../../../service/domain/service.entity';
import { Supply } from '../../../supply/domain/supply.entity';
import db from '../../../../shared/infrastructure/database/connection';

// Mock the database connection
jest.mock('../../../../shared/infrastructure/database/connection', () => ({
  query: jest.fn(),
}));

describe('PostgresServiceOrderRepository', () => {
  let repository: PostgresServiceOrderRepository;
  let mockDb: jest.Mocked<typeof db>;

  beforeEach(() => {
    repository = new PostgresServiceOrderRepository();
    mockDb = db as jest.Mocked<typeof db>;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service order successfully', async () => {
      const mockService = new Service({
        name: 'Test Service',
        description: 'Test Description',
        price: 100
      }, 1);

      const mockSupply = new Supply({
        name: 'Test Supply',
        quantity: 1,
        price: 50
      }, 1);

      const mockServiceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.APPROVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 150
      });

      const mockResult = {
        rows: [{
          id: 1,
          client_id: 1,
          vehicle_id: 1,
          services: '[{"id":1,"name":"Test Service","price":100}]',
          supplies: '[{"id":1,"name":"Test Supply","price":50}]',
          status: ServiceOrderStatus.APPROVED,
          created_at: new Date(),
          finalized_at: null,
          total_value: 150
        }]
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await repository.create(mockServiceOrder);

      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO service_orders (client_id, vehicle_id, services, supplies, status, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, client_id, vehicle_id, services, supplies, status, created_at',
        [
          mockServiceOrder.clientId,
          mockServiceOrder.vehicleId,
          JSON.stringify(mockServiceOrder.services),
          JSON.stringify(mockServiceOrder.supplies),
          mockServiceOrder.status,
          mockServiceOrder.createdAt
        ]
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.id).toBe(1);
    });

    it('should throw error when database query fails', async () => {
      const mockService = new Service({
        name: 'Test Service',
        description: 'Test Description',
        price: 100
      }, 1);

      const mockServiceOrder = new ServiceOrder({
        clientId: 1,
        vehicleId: 1,
        services: [mockService],
        supplies: [],
        status: ServiceOrderStatus.APPROVED,
        createdAt: new Date(),
        finalizedAt: new Date(),
        totalServicePrice: 100
      });

      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(mockServiceOrder)).rejects.toThrow('Failed to save service order');
    });
  });

  describe('update', () => {
    it('should update a service order successfully', async () => {
      const mockService = new Service({
        name: 'Updated Service',
        description: 'Updated Description',
        price: 200
      }, 1);

      const mockSupply = new Supply({
        name: 'Updated Supply',
        quantity: 2,
        price: 100
      }, 1);

      const mockUpdatedData = {
        services: [mockService],
        supplies: [mockSupply],
        status: ServiceOrderStatus.IN_PROGRESS,
        finalizedAt: new Date()
      };

      // Mock findById call
      const mockFindResult = {
        rows: [{
          id: 1,
          client_id: 1,
          vehicle_id: 1,
          services: '[]',
          supplies: '[]',
          status: ServiceOrderStatus.APPROVED,
          created_at: new Date(),
          finalized_at: null,
          total_value: 0
        }]
      };

      // Mock update call
      const mockUpdateResult = {
        rows: [{
          id: 1,
          client_id: 1,
          vehicle_id: 1,
          services: JSON.stringify(mockUpdatedData.services),
          supplies: JSON.stringify(mockUpdatedData.supplies),
          status: mockUpdatedData.status,
          created_at: new Date(),
          finalized_at: mockUpdatedData.finalizedAt,
          total_value: 300
        }]
      };

      mockDb.query
        .mockResolvedValueOnce(mockFindResult) // for findById
        .mockResolvedValueOnce(mockUpdateResult); // for update

      const result = await repository.update(1, mockUpdatedData);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.status).toBe(ServiceOrderStatus.IN_PROGRESS);
    });

    it('should throw error when service order not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      await expect(repository.update(999, {})).rejects.toThrow('Failed to update service order');
    });
  });

  describe('findAll', () => {
    it('should return all service orders', async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            client_id: 1,
            vehicle_id: 1,
            services: [{ id: 1, name: 'Service 1', price: 100 }],
            supplies: [{ id: 1, name: 'Supply 1', price: 50 }],
            status: ServiceOrderStatus.APPROVED,
            created_at: new Date(),
            finalized_at: null,
            total_value: 150
          },
          {
            id: 2,
            client_id: 2,
            vehicle_id: 2,
            services: [{ id: 2, name: 'Service 2', price: 200 }],
            supplies: [],
            status: ServiceOrderStatus.IN_PROGRESS,
            created_at: new Date(),
            finalized_at: null,
            total_value: 200
          }
        ]
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ServiceOrder);
      expect(result[1]).toBeInstanceOf(ServiceOrder);
    });

    it('should throw error when database query fails', async () => {
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAll()).rejects.toThrow('Failed to find all service orders');
    });
  });

  describe('findById', () => {
    it('should return service order when found', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          client_id: 1,
          vehicle_id: 1,
          services: [{ id: 1, name: 'Service 1', price: 100 }],
          supplies: [{ id: 1, name: 'Supply 1', price: 50 }],
          status: ServiceOrderStatus.APPROVED,
          created_at: new Date(),
          finalized_at: null,
          total_value: 150
        }]
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result?.id).toBe(1);
    });

    it('should return null when service order not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById(1)).rejects.toThrow('Failed to find service order by id');
    });
  });

  describe('findOpenOSByCarAndClient', () => {
    it('should return service order when found', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          client_id: 1,
          vehicle_id: 1,
          services: [{ id: 1, name: 'Service 1', price: 100 }],
          supplies: [{ id: 1, name: 'Supply 1', price: 50 }],
          status: ServiceOrderStatus.APPROVED,
          created_at: new Date(),
          finalized_at: null,
          total_value: 150
        }]
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await repository.findOpenOSByCarAndClient(1, 'client123');

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(result.id).toBe(1);
    });

    it('should return null when no open service order found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await repository.findOpenOSByCarAndClient(1, 'client123');

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.findOpenOSByCarAndClient(1, 'client123'))
        .rejects.toThrow('Failed to find service order by car and client');
    });
  });
});
