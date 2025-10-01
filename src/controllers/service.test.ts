import { ServiceController } from './service';
import { Service } from '../entities/service';
import { ServiceUseCases } from '../usecases/service';
import { ServicePresenter } from '../presenters/service';
import { verifyAndReturnError } from '../presenters/verify-and-return-error';
import { ValidationError } from '../usecases/errors/errors';

// Mock dependencies
jest.mock('../usecases/service');
jest.mock('../presenters/service');
jest.mock('../presenters/verify-and-return-error');
jest.mock('../gateways/service');

describe('ServiceController', () => {
  let serviceController: ServiceController;
  let mockDbConnection: any;
  let mockServiceUseCase: jest.Mocked<ServiceUseCases>;
  let mockServicePresenter: jest.Mocked<ServicePresenter>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockDbConnection = {};
    
    mockServiceUseCase = {
      createService: jest.fn(),
      updateService: jest.fn(),
      findServiceById: jest.fn(),
      findAllServices: jest.fn(),
      deleteService: jest.fn(),
    } as any;

    mockServicePresenter = {
      present: jest.fn(),
      presentUpdated: jest.fn(),
      presentFound: jest.fn(),
      presentList: jest.fn(),
      presentDeleted: jest.fn(),
      getStatusCode: jest.fn().mockReturnValue(200),
      getResponse: jest.fn().mockReturnValue({ success: true }),
    } as any;

    (ServiceUseCases as jest.Mock).mockImplementation(() => mockServiceUseCase);
    (ServicePresenter as jest.Mock).mockImplementation(() => mockServicePresenter);

    serviceController = new ServiceController(mockDbConnection);

    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service successfully', async () => {
      const serviceData = {
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.00
      };
      
      mockReq.body = serviceData;
      
      const mockService = new Service(serviceData, 1);
      mockServiceUseCase.createService.mockResolvedValue(mockService);

      await serviceController.create(mockReq, mockRes);

      expect(mockServiceUseCase.createService).toHaveBeenCalledWith(expect.any(Service));
      expect(mockServicePresenter.present).toHaveBeenCalledWith(mockService);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ success: true });
    });

    it('should handle validation error', async () => {
      const serviceData = {
        name: '',
        description: 'Descrição',
        price: 50.00
      };
      
      mockReq.body = serviceData;
      
      const error = new ValidationError('Nome do serviço é obrigatório');
      mockServiceUseCase.createService.mockRejectedValue(error);

      await serviceController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('update', () => {
    it('should update a service successfully', async () => {
      const updateData = {
        name: 'Troca de óleo premium',
        price: 120.00
      };
      
      mockReq.params.id = '1';
      mockReq.body = updateData;
      
      const mockService = new Service({ 
        name: 'Troca de óleo premium', 
        description: 'Descrição', 
        price: 120.00 
      }, 1);
      mockServiceUseCase.updateService.mockResolvedValue(mockService);

      await serviceController.update(mockReq, mockRes);

      expect(mockServiceUseCase.updateService).toHaveBeenCalledWith(1, updateData);
      expect(mockServicePresenter.presentUpdated).toHaveBeenCalledWith(mockService);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle update error', async () => {
      mockReq.params.id = '999';
      mockReq.body = { name: 'Test' };
      
      const error = new Error('Serviço não encontrado');
      mockServiceUseCase.updateService.mockRejectedValue(error);

      await serviceController.update(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('find', () => {
    it('should find a service by id', async () => {
      mockReq.params.id = '1';
      
      const mockService = new Service({
        name: 'Troca de óleo',
        description: 'Descrição',
        price: 80.00
      }, 1);
      mockServiceUseCase.findServiceById.mockResolvedValue(mockService);

      await serviceController.find(mockReq, mockRes);

      expect(mockServiceUseCase.findServiceById).toHaveBeenCalledWith('1');
      expect(mockServicePresenter.presentFound).toHaveBeenCalledWith(mockService);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should find all services when no id provided', async () => {
      const mockServices = [
        new Service({ name: 'Troca de óleo', description: 'Desc1', price: 80.00 }, 1),
        new Service({ name: 'Alinhamento', description: 'Desc2', price: 60.00 }, 2)
      ];
      
      mockServiceUseCase.findAllServices.mockResolvedValue(mockServices);

      await serviceController.find(mockReq, mockRes);

      expect(mockServiceUseCase.findAllServices).toHaveBeenCalled();
      expect(mockServicePresenter.presentList).toHaveBeenCalledWith(mockServices);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle find error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Serviço não encontrado');
      mockServiceUseCase.findServiceById.mockRejectedValue(error);

      await serviceController.find(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('delete', () => {
    it('should delete a service successfully', async () => {
      mockReq.params.id = '1';
      
      mockServiceUseCase.deleteService.mockResolvedValue();

      await serviceController.delete(mockReq, mockRes);

      expect(mockServiceUseCase.deleteService).toHaveBeenCalledWith('1');
      expect(mockServicePresenter.presentDeleted).toHaveBeenCalledWith({ id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle delete error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Serviço não encontrado');
      mockServiceUseCase.deleteService.mockRejectedValue(error);

      await serviceController.delete(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });
});