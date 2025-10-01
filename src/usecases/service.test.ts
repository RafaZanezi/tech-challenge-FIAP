import { ServiceUseCases } from './service';
import { Service } from '../entities/service';
import { ServiceGatewayInterface } from '../interfaces/gateways';
import { ConflictError } from './errors/errors';
import { NotFoundHttpError } from '../api/errors/http-errors';

describe('ServiceUseCases', () => {
  let serviceUseCases: ServiceUseCases;
  let mockServiceGateway: jest.Mocked<ServiceGatewayInterface>;

  beforeEach(() => {
    mockServiceGateway = {
      insert: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    serviceUseCases = new ServiceUseCases(mockServiceGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create a service successfully', async () => {
      const serviceData = {
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.00
      };

      const service = new Service(serviceData);
      const savedServiceDTO = { id: 1, name: 'Troca de óleo', description: 'Troca completa de óleo do motor', price: 80.00 };

      mockServiceGateway.findByName.mockResolvedValue(null);
      mockServiceGateway.insert.mockResolvedValue(savedServiceDTO);

      const result = await serviceUseCases.createService(service);

      expect(mockServiceGateway.findByName).toHaveBeenCalledWith('Troca de óleo');
      expect(mockServiceGateway.insert).toHaveBeenCalledWith(service);
      expect(result).toBeInstanceOf(Service);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Troca de óleo');
      expect(result.description).toBe('Troca completa de óleo do motor');
      expect(result.price).toBe(80.00);
    });

    it('should throw ConflictError when service with same name exists', async () => {
      const serviceData = {
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.00
      };

      const service = new Service(serviceData);
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 70.00 };

      mockServiceGateway.findByName.mockResolvedValue(existingService);

      await expect(serviceUseCases.createService(service)).rejects.toThrow(ConflictError);
      await expect(serviceUseCases.createService(service)).rejects.toThrow('Serviço com este nome já existe');
      
      expect(mockServiceGateway.findByName).toHaveBeenCalledWith('Troca de óleo');
      expect(mockServiceGateway.insert).not.toHaveBeenCalled();
    });
  });

  describe('findServiceById', () => {
    it('should find a service by id successfully', async () => {
      const serviceDTO = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };

      mockServiceGateway.findById.mockResolvedValue(serviceDTO);

      const result = await serviceUseCases.findServiceById(1);

      expect(mockServiceGateway.findById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(Service);
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Troca de óleo');
      expect(result!.description).toBe('Descrição');
      expect(result!.price).toBe(80.00);
    });

    it('should throw NotFoundHttpError when service not found', async () => {
      mockServiceGateway.findById.mockResolvedValue(null);

      await expect(serviceUseCases.findServiceById(999)).rejects.toThrow(NotFoundHttpError);
      await expect(serviceUseCases.findServiceById(999)).rejects.toThrow('Serviço');
      
      expect(mockServiceGateway.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findAllServices', () => {
    it('should find all services successfully', async () => {
      const servicesDTO = [
        { id: 1, name: 'Troca de óleo', description: 'Descrição 1', price: 80.00 },
        { id: 2, name: 'Alinhamento', description: 'Descrição 2', price: 60.00 }
      ];

      mockServiceGateway.findAll.mockResolvedValue(servicesDTO);

      const result = await serviceUseCases.findAllServices();

      expect(mockServiceGateway.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Service);
      expect(result[0].name).toBe('Troca de óleo');
      expect(result[1]).toBeInstanceOf(Service);
      expect(result[1].name).toBe('Alinhamento');
    });

    it('should return empty array when no services found', async () => {
      mockServiceGateway.findAll.mockResolvedValue([]);

      const result = await serviceUseCases.findAllServices();

      expect(result).toEqual([]);
      expect(mockServiceGateway.findAll).toHaveBeenCalled();
    });
  });

  describe('updateService', () => {
    it('should update a service successfully', async () => {
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };
      const updateData = { name: 'Troca de óleo premium', description: 'Nova descrição', price: 120.00 } as Service;
      const updatedServiceDTO = { id: 1, name: 'Troca de óleo premium', description: 'Nova descrição', price: 120.00 };

      mockServiceGateway.findById.mockResolvedValue(existingService);
      mockServiceGateway.findByName.mockResolvedValue(null);
      mockServiceGateway.update.mockResolvedValue(updatedServiceDTO);

      const result = await serviceUseCases.updateService(1, updateData);

      expect(mockServiceGateway.findById).toHaveBeenCalledWith(1);
      expect(mockServiceGateway.update).toHaveBeenCalledWith(1, { 
        name: 'Troca de óleo premium', 
        description: 'Nova descrição',
        price: 120.00 
      });
      expect(result).toBeInstanceOf(Service);
      expect(result.name).toBe('Troca de óleo premium');
    });

    it('should update service without changing name', async () => {
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };
      const updateData = { description: 'Nova descrição', price: 100.00 } as Service;
      const updatedServiceDTO = { id: 1, name: 'Troca de óleo', description: 'Nova descrição', price: 100.00 };

      mockServiceGateway.findById.mockResolvedValue(existingService);
      mockServiceGateway.update.mockResolvedValue(updatedServiceDTO);

      const result = await serviceUseCases.updateService(1, updateData);

      expect(mockServiceGateway.update).toHaveBeenCalledWith(1, { 
        name: 'Troca de óleo', 
        description: 'Nova descrição',
        price: 100.00 
      });
      expect(result.name).toBe('Troca de óleo');
      expect(result.description).toBe('Nova descrição');
      expect(result.price).toBe(100.00);
    });

    it('should throw NotFoundHttpError when service not found', async () => {
      const updateData = { name: 'Novo nome' } as Service;

      mockServiceGateway.findById.mockResolvedValue(null);

      await expect(serviceUseCases.updateService(999, updateData)).rejects.toThrow(NotFoundHttpError);
      await expect(serviceUseCases.updateService(999, updateData)).rejects.toThrow('Serviço');
      
      expect(mockServiceGateway.findById).toHaveBeenCalledWith(999);
      expect(mockServiceGateway.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists for another service', async () => {
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };
      const updateData = { name: 'Alinhamento' } as Service;
      const conflictingService = { id: 2, name: 'Alinhamento', description: 'Outro serviço', price: 60.00 };

      mockServiceGateway.findById.mockResolvedValue(existingService);
      mockServiceGateway.findByName.mockResolvedValue(conflictingService);

      await expect(serviceUseCases.updateService(1, updateData)).rejects.toThrow(ConflictError);
      await expect(serviceUseCases.updateService(1, updateData)).rejects.toThrow('Serviço com este nome já existe');
      
      expect(mockServiceGateway.findByName).toHaveBeenCalledWith('Alinhamento');
      expect(mockServiceGateway.update).not.toHaveBeenCalled();
    });

    it('should allow updating service with same name', async () => {
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };
      const updateData = { name: 'Troca de óleo', description: 'Nova descrição' } as Service;
      const sameService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };
      const updatedServiceDTO = { id: 1, name: 'Troca de óleo', description: 'Nova descrição', price: 80.00 };

      mockServiceGateway.findById.mockResolvedValue(existingService);
      mockServiceGateway.findByName.mockResolvedValue(sameService);
      mockServiceGateway.update.mockResolvedValue(updatedServiceDTO);

      const result = await serviceUseCases.updateService(1, updateData);

      expect(result.description).toBe('Nova descrição');
      expect(mockServiceGateway.update).toHaveBeenCalled();
    });
  });

  describe('deleteService', () => {
    it('should delete a service successfully', async () => {
      const existingService = { id: 1, name: 'Troca de óleo', description: 'Descrição', price: 80.00 };

      mockServiceGateway.findById.mockResolvedValue(existingService);
      mockServiceGateway.delete.mockResolvedValue();

      await serviceUseCases.deleteService(1);

      expect(mockServiceGateway.findById).toHaveBeenCalledWith(1);
      expect(mockServiceGateway.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundHttpError when service not found', async () => {
      mockServiceGateway.findById.mockResolvedValue(null);

      await expect(serviceUseCases.deleteService(999)).rejects.toThrow(NotFoundHttpError);
      await expect(serviceUseCases.deleteService(999)).rejects.toThrow('Serviço');
      
      expect(mockServiceGateway.findById).toHaveBeenCalledWith(999);
      expect(mockServiceGateway.delete).not.toHaveBeenCalled();
    });
  });
});