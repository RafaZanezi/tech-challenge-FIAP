import ServiceOrderController from './service-order.controller';
import { CreateOSUseCase } from '../../application/use-cases/create-os.use-case';
import { FindAllOSUseCase } from '../../application/use-cases/find-all-os.use-case';
import { FindOSUseCase } from '../../application/use-cases/find-os.use-case';
import { UpdateOSUseCase } from '../../application/use-cases/update-os.use-case';
import { UpdateServicesAndSuppliesUseCase } from '../../application/use-cases/update-services-and-supplies.use-case';
import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';

// Mock dos use cases
jest.mock('../../application/use-cases/create-os.use-case');
jest.mock('../../application/use-cases/find-all-os.use-case');
jest.mock('../../application/use-cases/find-os.use-case');
jest.mock('../../application/use-cases/update-os.use-case');
jest.mock('../../application/use-cases/update-services-and-supplies.use-case');

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let mockCreateOSUseCase: jest.Mocked<CreateOSUseCase>;
  let mockFindAllOSUseCase: jest.Mocked<FindAllOSUseCase>;
  let mockFindOSUseCase: jest.Mocked<FindOSUseCase>;
  let mockUpdateOSUseCase: jest.Mocked<UpdateOSUseCase>;
  let mockUpdateServicesAndSuppliesUseCase: jest.Mocked<UpdateServicesAndSuppliesUseCase>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockCreateOSUseCase = {
      execute: jest.fn()
    } as any;
    
    mockFindAllOSUseCase = {
      execute: jest.fn()
    } as any;
    
    mockFindOSUseCase = {
      execute: jest.fn()
    } as any;
    
    mockUpdateOSUseCase = {
      execute: jest.fn()
    } as any;
    
    mockUpdateServicesAndSuppliesUseCase = {
      execute: jest.fn()
    } as any;

    controller = new ServiceOrderController(
      mockCreateOSUseCase,
      mockUpdateOSUseCase,
      mockUpdateServicesAndSuppliesUseCase,
      mockFindAllOSUseCase,
      mockFindOSUseCase
    );

    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        status: ServiceOrderStatus.RECEIVED
      };

      req.body = { clientId: 1, vehicleId: 1 };
      mockCreateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.create(req, res);

      expect(mockCreateOSUseCase.execute).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceOrder
      });
    });

    it('should handle error during creation', async () => {
      const error = { statusCode: 400, message: 'Invalid data' };
      req.body = { clientId: 1, vehicleId: 1 };
      mockCreateOSUseCase.execute = jest.fn().mockRejectedValue(error);

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data'
      });
    });

    it('should handle error without statusCode', async () => {
      const error = new Error('Generic error');
      req.body = { clientId: 1, vehicleId: 1 };
      mockCreateOSUseCase.execute = jest.fn().mockRejectedValue(error);

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Generic error'
      });
    });
  });

  describe('find', () => {
    it('should find service order by id', async () => {
      const mockServiceOrder = {
        id: 1,
        clientId: 1,
        vehicleId: 1,
        status: ServiceOrderStatus.RECEIVED
      };

      req.params.id = '1';
      mockFindOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.find(req, res);

      expect(mockFindOSUseCase.execute).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceOrder
      });
    });

    it('should find all service orders when no id provided', async () => {
      const mockServiceOrders = [
        { id: 1, clientId: 1, vehicleId: 1, status: ServiceOrderStatus.RECEIVED },
        { id: 2, clientId: 2, vehicleId: 2, status: ServiceOrderStatus.IN_PROGRESS }
      ];

      req.params = {};
      mockFindAllOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrders);

      await controller.find(req, res);

      expect(mockFindAllOSUseCase.execute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceOrders
      });
    });

    it('should handle error during find', async () => {
      const error = { statusCode: 404, message: 'Not found' };
      req.params.id = '999';
      mockFindOSUseCase.execute = jest.fn().mockRejectedValue(error);

      await controller.find(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not found'
      });
    });
  });

  describe('startDiagnosis', () => {
    it('should start diagnosis successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.IN_DIAGNOSIS
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.startDiagnosis(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.IN_DIAGNOSIS
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceOrder
      });
    });

    it('should handle error during start diagnosis', async () => {
      const error = { statusCode: 400, message: 'Cannot start diagnosis' };
      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockRejectedValue(error);

      await controller.startDiagnosis(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot start diagnosis'
      });
    });
  });

  describe('update', () => {
    it('should update service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        services: [],
        supplies: []
      };

      req.params.id = '1';
      req.body = { services: [], supplies: [] };
      mockUpdateServicesAndSuppliesUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.update(req, res);

      expect(mockUpdateServicesAndSuppliesUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        services: [],
        supplies: []
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceOrder
      });
    });
  });

  describe('submitForApproval', () => {
    it('should submit for approval successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.WAITING_FOR_APPROVAL
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.submitForApproval(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.WAITING_FOR_APPROVAL
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('approve', () => {
    it('should approve service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.APPROVED
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.approve(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.APPROVED
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('startExecution', () => {
    it('should start execution successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.IN_PROGRESS
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.startExecution(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.IN_PROGRESS
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('finalize', () => {
    it('should finalize service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.FINISHED
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.finalize(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.FINISHED,
        finishedAt: expect.any(Date)
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deliver', () => {
    it('should deliver service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.DELIVERED
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.deliver(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.DELIVERED
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('cancel', () => {
    it('should cancel service order successfully', async () => {
      const mockServiceOrder = {
        id: 1,
        status: ServiceOrderStatus.CANCELLED
      };

      req.params.id = '1';
      mockUpdateOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrder);

      await controller.cancel(req, res);

      expect(mockUpdateOSUseCase.execute).toHaveBeenCalledWith({
        id: '1',
        status: ServiceOrderStatus.CANCELLED,
        finishedAt: expect.any(Date)
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('time', () => {
    it('should calculate average time successfully', async () => {
      const mockServiceOrders = [
        {
          id: 1,
          createdAt: new Date('2023-01-01'),
          finalizedAt: new Date('2023-01-02')
        },
        {
          id: 2,
          createdAt: new Date('2023-01-01'),
          finalizedAt: new Date('2023-01-03')
        }
      ];

      mockFindAllOSUseCase.execute = jest.fn().mockResolvedValue(mockServiceOrders);

      await controller.time(req, res);

      expect(mockFindAllOSUseCase.execute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          averageTimeDays: expect.any(Number),
          averageTimeHours: expect.any(Number),
          averageTimeInMinutes: expect.any(Number)
        })
      });
    });

    it('should handle error during time calculation', async () => {
      const error = { statusCode: 500, message: 'Database error' };
      mockFindAllOSUseCase.execute = jest.fn().mockRejectedValue(error);

      await controller.time(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });
});
