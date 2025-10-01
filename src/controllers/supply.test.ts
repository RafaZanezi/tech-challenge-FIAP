import { SupplyController } from './supply';
import { SupplyUseCases } from '../usecases/supply';
import { SupplyPresenter } from '../presenters/supply';
import { verifyAndReturnError } from '../presenters/verify-and-return-error';
import { Supply } from '../entities/supply';
import { ConflictError } from '../usecases/errors/errors';
import { NotFoundHttpError } from '../api/errors/http-errors';

// Mock modules
jest.mock('../usecases/supply');
jest.mock('../presenters/supply');
jest.mock('../presenters/verify-and-return-error');
jest.mock('../gateways/supply');

describe('SupplyController', () => {
  let supplyController: SupplyController;
  let mockSupplyUseCases: jest.Mocked<SupplyUseCases>;
  let mockSupplyPresenter: jest.Mocked<SupplyPresenter>;
  let mockDbConnection: any;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockSupplyUseCases = {
      createSupply: jest.fn(),
      findSupplyById: jest.fn(),
      findAllSupplies: jest.fn(),
      updateSupply: jest.fn(),
      deleteSupply: jest.fn(),
    } as any;

    mockSupplyPresenter = {
      present: jest.fn(),
      presentUpdated: jest.fn(),
      presentFound: jest.fn(),
      presentList: jest.fn(),
      presentDeleted: jest.fn(),
      getStatusCode: jest.fn(),
      getResponse: jest.fn(),
    } as any;

    mockDbConnection = {};

    (SupplyUseCases as jest.MockedClass<typeof SupplyUseCases>).mockImplementation(() => mockSupplyUseCases);
    (SupplyPresenter as jest.MockedClass<typeof SupplyPresenter>).mockImplementation(() => mockSupplyPresenter);

    supplyController = new SupplyController(mockDbConnection);

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
    it('should create a supply successfully', async () => {
      const supplyData = {
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      };

      mockReq.body = supplyData;

      const createdSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 } as Supply;
      mockSupplyUseCases.createSupply.mockResolvedValue(createdSupply);
      mockSupplyPresenter.getStatusCode.mockReturnValue(201);
      mockSupplyPresenter.getResponse.mockReturnValue({ data: createdSupply });

      await supplyController.create(mockReq, mockRes);

      expect(mockSupplyUseCases.createSupply).toHaveBeenCalledWith(expect.any(Supply));
      expect(mockSupplyPresenter.present).toHaveBeenCalledWith(createdSupply);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith({ data: createdSupply });
    });

    it('should handle ConflictError when supply name already exists', async () => {
      const supplyData = {
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      };

      mockReq.body = supplyData;

      const conflictError = new ConflictError('Insumo com este nome já existe');
      mockSupplyUseCases.createSupply.mockRejectedValue(conflictError);

      await supplyController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(conflictError, mockRes);
    });

    it('should handle validation errors', async () => {
      const invalidSupplyData = {
        name: '',
        quantity: -1,
        price: -10
      };

      mockReq.body = invalidSupplyData;

      // O erro real vem da validação da entidade Supply
      await supplyController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(expect.any(Error), mockRes);
    });
  });

  describe('update', () => {
    it('should update a supply successfully', async () => {
      const updateData = {
        name: 'Filtro de óleo premium',
        quantity: 15,
        price: 35.00
      };

      mockReq.params.id = '1';
      mockReq.body = updateData;

      const updatedSupply = { id: 1, name: 'Filtro de óleo premium', quantity: 15, price: 35.00 } as Supply;
      mockSupplyUseCases.updateSupply.mockResolvedValue(updatedSupply);
      mockSupplyPresenter.getStatusCode.mockReturnValue(200);
      mockSupplyPresenter.getResponse.mockReturnValue({ data: updatedSupply });

      await supplyController.update(mockReq, mockRes);

      expect(mockSupplyUseCases.updateSupply).toHaveBeenCalledWith(1, updateData);
      expect(mockSupplyPresenter.presentUpdated).toHaveBeenCalledWith(updatedSupply);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ data: updatedSupply });
    });

    it('should handle NotFoundHttpError when supply not found', async () => {
      const updateData = { name: 'Novo nome' };

      mockReq.params.id = '999';
      mockReq.body = updateData;

      const notFoundError = new NotFoundHttpError('Insumo');
      mockSupplyUseCases.updateSupply.mockRejectedValue(notFoundError);

      await supplyController.update(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(notFoundError, mockRes);
    });

    it('should handle ConflictError when new name already exists', async () => {
      const updateData = { name: 'Nome existente' };

      mockReq.params.id = '1';
      mockReq.body = updateData;

      const conflictError = new ConflictError('Insumo com este nome já existe');
      mockSupplyUseCases.updateSupply.mockRejectedValue(conflictError);

      await supplyController.update(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(conflictError, mockRes);
    });
  });

  describe('find', () => {
    it('should find a supply by id successfully', async () => {
      mockReq.params.id = '1';

      const supply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 } as Supply;
      mockSupplyUseCases.findSupplyById.mockResolvedValue(supply);
      mockSupplyPresenter.getStatusCode.mockReturnValue(200);
      mockSupplyPresenter.getResponse.mockReturnValue({ data: supply });

      await supplyController.find(mockReq, mockRes);

      expect(mockSupplyUseCases.findSupplyById).toHaveBeenCalledWith('1');
      expect(mockSupplyPresenter.presentFound).toHaveBeenCalledWith(supply);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ data: supply });
    });

    it('should find all supplies when no id provided', async () => {
      mockReq.params.id = undefined;

      const supplies = [
        { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 } as Supply,
        { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.00 } as Supply
      ];
      mockSupplyUseCases.findAllSupplies.mockResolvedValue(supplies);
      mockSupplyPresenter.getStatusCode.mockReturnValue(200);
      mockSupplyPresenter.getResponse.mockReturnValue({ data: supplies });

      await supplyController.find(mockReq, mockRes);

      expect(mockSupplyUseCases.findAllSupplies).toHaveBeenCalled();
      expect(mockSupplyPresenter.presentList).toHaveBeenCalledWith(supplies);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ data: supplies });
    });

    it('should handle NotFoundHttpError when supply not found by id', async () => {
      mockReq.params.id = '999';

      const notFoundError = new NotFoundHttpError('Insumo');
      mockSupplyUseCases.findSupplyById.mockRejectedValue(notFoundError);

      await supplyController.find(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(notFoundError, mockRes);
    });

    it('should return empty list when no supplies found', async () => {
      mockReq.params.id = undefined;

      mockSupplyUseCases.findAllSupplies.mockResolvedValue([]);
      mockSupplyPresenter.getStatusCode.mockReturnValue(200);
      mockSupplyPresenter.getResponse.mockReturnValue({ data: [] });

      await supplyController.find(mockReq, mockRes);

      expect(mockSupplyUseCases.findAllSupplies).toHaveBeenCalled();
      expect(mockSupplyPresenter.presentList).toHaveBeenCalledWith([]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe('delete', () => {
    it('should delete a supply successfully', async () => {
      mockReq.params.id = '1';

      mockSupplyUseCases.deleteSupply.mockResolvedValue();
      mockSupplyPresenter.getStatusCode.mockReturnValue(200);
      mockSupplyPresenter.getResponse.mockReturnValue({ message: 'Insumo deletado com sucesso' });

      await supplyController.delete(mockReq, mockRes);

      expect(mockSupplyUseCases.deleteSupply).toHaveBeenCalledWith('1');
      expect(mockSupplyPresenter.presentDeleted).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Insumo deletado com sucesso' });
    });

    it('should handle NotFoundHttpError when supply not found', async () => {
      mockReq.params.id = '999';

      const notFoundError = new NotFoundHttpError('Insumo');
      mockSupplyUseCases.deleteSupply.mockRejectedValue(notFoundError);

      await supplyController.delete(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(notFoundError, mockRes);
    });
  });
});