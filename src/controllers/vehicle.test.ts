import { VehicleController } from './vehicle';
import { Vehicle } from '../entities/vehicle';
import { VehicleUseCases } from '../usecases/vehicle';
import { VehiclePresenter } from '../presenters/vehicle';
import { verifyAndReturnError } from '../presenters/verify-and-return-error';
import { ValidationError } from '../usecases/errors/errors';

// Mock dependencies
jest.mock('../usecases/vehicle');
jest.mock('../presenters/vehicle');
jest.mock('../presenters/verify-and-return-error');
jest.mock('../gateways/vehicle');
jest.mock('../gateways/client');

describe('VehicleController', () => {
  let vehicleController: VehicleController;
  let mockDbConnection: any;
  let mockVehicleUseCase: jest.Mocked<VehicleUseCases>;
  let mockVehiclePresenter: jest.Mocked<VehiclePresenter>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockDbConnection = {};
    
    mockVehicleUseCase = {
      createVehicle: jest.fn(),
      updateVehicle: jest.fn(),
      findVehicleById: jest.fn(),
      findAllVehicles: jest.fn(),
      findVehiclesByClientId: jest.fn(),
      deleteVehicle: jest.fn(),
    } as any;

    mockVehiclePresenter = {
      present: jest.fn(),
      presentUpdated: jest.fn(),
      presentFound: jest.fn(),
      presentList: jest.fn(),
      presentDeleted: jest.fn(),
      getStatusCode: jest.fn().mockReturnValue(200),
      getResponse: jest.fn().mockReturnValue({ success: true }),
    } as any;

    (VehicleUseCases as jest.Mock).mockImplementation(() => mockVehicleUseCase);
    (VehiclePresenter as jest.Mock).mockImplementation(() => mockVehiclePresenter);

    vehicleController = new VehicleController(mockDbConnection);

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
    it('should create a vehicle successfully', async () => {
      const vehicleData = {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      };
      
      mockReq.body = vehicleData;
      
      const mockVehicle = new Vehicle(vehicleData, 1);
      mockVehicleUseCase.createVehicle.mockResolvedValue(mockVehicle);

      await vehicleController.create(mockReq, mockRes);

      expect(mockVehicleUseCase.createVehicle).toHaveBeenCalledWith(expect.any(Vehicle));
      expect(mockVehiclePresenter.present).toHaveBeenCalledWith(mockVehicle);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ success: true });
    });

    it('should handle validation error', async () => {
      const vehicleData = {
        brand: '',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      };
      
      mockReq.body = vehicleData;
      
      const error = new ValidationError('Marca do veículo é obrigatória');
      mockVehicleUseCase.createVehicle.mockRejectedValue(error);

      await vehicleController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('update', () => {
    it('should update a vehicle successfully', async () => {
      const updateData = {
        brand: 'Honda',
      };
      
      mockReq.params.id = '1';
      mockReq.body = updateData;
      
      const mockVehicle = new Vehicle({
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        licensePlate: 'XYZ9876',
        clientId: 1
      }, 1);
      mockVehicleUseCase.updateVehicle.mockResolvedValue(mockVehicle);

      await vehicleController.update(mockReq, mockRes);

      expect(mockVehicleUseCase.updateVehicle).toHaveBeenCalledWith(1, updateData);
      expect(mockVehiclePresenter.presentUpdated).toHaveBeenCalledWith(mockVehicle);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle update error', async () => {
      mockReq.params.id = '999';
      mockReq.body = { brand: 'Test' };
      
      const error = new Error('Veículo não encontrado');
      mockVehicleUseCase.updateVehicle.mockRejectedValue(error);

      await vehicleController.update(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('find', () => {
    it('should find a vehicle by id', async () => {
      mockReq.params.id = '1';
      
      const mockVehicle = new Vehicle({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
      }, 1);
      mockVehicleUseCase.findVehicleById.mockResolvedValue(mockVehicle);

      await vehicleController.find(mockReq, mockRes);

      expect(mockVehicleUseCase.findVehicleById).toHaveBeenCalledWith('1');
      expect(mockVehiclePresenter.presentFound).toHaveBeenCalledWith(mockVehicle);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should find all vehicles when no id provided', async () => {
      const mockVehicles = [
        new Vehicle({
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          licensePlate: 'ABC1234',
          clientId: 1
        }, 1),
        new Vehicle({
          brand: 'Honda',
          model: 'Civic',
          year: 2021,
          licensePlate: 'XYZ9876',
          clientId: 2
        }, 2)
      ];
      
      mockVehicleUseCase.findAllVehicles.mockResolvedValue(mockVehicles);

      await vehicleController.find(mockReq, mockRes);

      expect(mockVehicleUseCase.findAllVehicles).toHaveBeenCalled();
      expect(mockVehiclePresenter.presentList).toHaveBeenCalledWith(mockVehicles);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle find error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Veículo não encontrado');
      mockVehicleUseCase.findVehicleById.mockRejectedValue(error);

      await vehicleController.find(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('findByClient', () => {
    it('should find vehicles by client id', async () => {
      mockReq.params.clientId = '1';
      
      const mockVehicles = [
        new Vehicle({
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          licensePlate: 'ABC1234',
          clientId: 1
        }, 1),
        new Vehicle({
          brand: 'Honda',
          model: 'Civic',
          year: 2021,
          licensePlate: 'XYZ9876',
          clientId: 1
        }, 2)
      ];
      
      mockVehicleUseCase.findVehiclesByClientId.mockResolvedValue(mockVehicles);

      await vehicleController.findByClient(mockReq, mockRes);

      expect(mockVehicleUseCase.findVehiclesByClientId).toHaveBeenCalledWith(1);
      expect(mockVehiclePresenter.presentList).toHaveBeenCalledWith(mockVehicles);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle find by client error', async () => {
      mockReq.params.clientId = '999';
      
      const error = new Error('Cliente não encontrado');
      mockVehicleUseCase.findVehiclesByClientId.mockRejectedValue(error);

      await vehicleController.findByClient(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('delete', () => {
    it('should delete a vehicle successfully', async () => {
      mockReq.params.id = '1';
      
      mockVehicleUseCase.deleteVehicle.mockResolvedValue();

      await vehicleController.delete(mockReq, mockRes);

      expect(mockVehicleUseCase.deleteVehicle).toHaveBeenCalledWith('1');
      expect(mockVehiclePresenter.presentDeleted).toHaveBeenCalledWith({ id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle delete error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Veículo não encontrado');
      mockVehicleUseCase.deleteVehicle.mockRejectedValue(error);

      await vehicleController.delete(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });
});