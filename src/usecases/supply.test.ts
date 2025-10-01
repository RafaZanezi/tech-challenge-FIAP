import { SupplyUseCases } from './supply';
import { Supply } from '../entities/supply';
import { SupplyGatewayInterface } from '../interfaces/gateways';
import { ConflictError } from './errors/errors';
import { NotFoundHttpError } from '../api/errors/http-errors';

describe('SupplyUseCases', () => {
  let supplyUseCases: SupplyUseCases;
  let mockSupplyGateway: jest.Mocked<SupplyGatewayInterface>;

  beforeEach(() => {
    mockSupplyGateway = {
      insert: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    supplyUseCases = new SupplyUseCases(mockSupplyGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupply', () => {
    it('should create a supply successfully', async () => {
      const supplyData = {
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      };

      const supply = new Supply(supplyData);
      const savedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockSupplyGateway.findByName.mockResolvedValue(null);
      mockSupplyGateway.insert.mockResolvedValue(savedSupplyDTO);

      const result = await supplyUseCases.createSupply(supply);

      expect(mockSupplyGateway.findByName).toHaveBeenCalledWith('Filtro de óleo');
      expect(mockSupplyGateway.insert).toHaveBeenCalledWith(supply);
      expect(result).toBeInstanceOf(Supply);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Filtro de óleo');
      expect(result.quantity).toBe(10);
      expect(result.price).toBe(25.50);
    });

    it('should throw ConflictError when supply with same name exists', async () => {
      const supplyData = {
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      };

      const supply = new Supply(supplyData);
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 5, price: 20.00 };

      mockSupplyGateway.findByName.mockResolvedValue(existingSupply);

      await expect(supplyUseCases.createSupply(supply)).rejects.toThrow(ConflictError);
      await expect(supplyUseCases.createSupply(supply)).rejects.toThrow('Insumo com este nome já existe');
      
      expect(mockSupplyGateway.findByName).toHaveBeenCalledWith('Filtro de óleo');
      expect(mockSupplyGateway.insert).not.toHaveBeenCalled();
    });
  });

  describe('findSupplyById', () => {
    it('should find a supply by id successfully', async () => {
      const supplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockSupplyGateway.findById.mockResolvedValue(supplyDTO);

      const result = await supplyUseCases.findSupplyById(1);

      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(Supply);
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Filtro de óleo');
      expect(result!.quantity).toBe(10);
      expect(result!.price).toBe(25.50);
    });

    it('should throw NotFoundHttpError when supply not found', async () => {
      mockSupplyGateway.findById.mockResolvedValue(null);

      await expect(supplyUseCases.findSupplyById(999)).rejects.toThrow(NotFoundHttpError);
      await expect(supplyUseCases.findSupplyById(999)).rejects.toThrow('Insumo');
      
      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findAllSupplies', () => {
    it('should find all supplies successfully', async () => {
      const suppliesDTO = [
        { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 },
        { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.00 }
      ];

      mockSupplyGateway.findAll.mockResolvedValue(suppliesDTO);

      const result = await supplyUseCases.findAllSupplies();

      expect(mockSupplyGateway.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Supply);
      expect(result[0].name).toBe('Filtro de óleo');
      expect(result[1]).toBeInstanceOf(Supply);
      expect(result[1].name).toBe('Filtro de ar');
    });

    it('should return empty array when no supplies found', async () => {
      mockSupplyGateway.findAll.mockResolvedValue([]);

      const result = await supplyUseCases.findAllSupplies();

      expect(result).toEqual([]);
      expect(mockSupplyGateway.findAll).toHaveBeenCalled();
    });
  });

  describe('updateSupply', () => {
    it('should update a supply successfully', async () => {
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };
      const updateData = { name: 'Filtro de óleo premium', quantity: 15, price: 35.00 } as Supply;
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo premium', quantity: 15, price: 35.00 };

      mockSupplyGateway.findById.mockResolvedValue(existingSupply);
      mockSupplyGateway.findByName.mockResolvedValue(null);
      mockSupplyGateway.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyUseCases.updateSupply(1, updateData);

      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(1);
      expect(mockSupplyGateway.update).toHaveBeenCalledWith(1, { 
        name: 'Filtro de óleo premium', 
        quantity: 15,
        price: 35.00 
      });
      expect(result).toBeInstanceOf(Supply);
      expect(result.name).toBe('Filtro de óleo premium');
    });

    it('should update supply without changing name', async () => {
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };
      const updateData = { quantity: 20, price: 30.00 } as Supply;
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 20, price: 30.00 };

      mockSupplyGateway.findById.mockResolvedValue(existingSupply);
      mockSupplyGateway.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyUseCases.updateSupply(1, updateData);

      expect(mockSupplyGateway.update).toHaveBeenCalledWith(1, { 
        name: 'Filtro de óleo', 
        quantity: 20,
        price: 30.00 
      });
      expect(result.name).toBe('Filtro de óleo');
      expect(result.quantity).toBe(20);
      expect(result.price).toBe(30.00);
    });

    it('should throw NotFoundHttpError when supply not found', async () => {
      const updateData = { name: 'Novo nome' } as Supply;

      mockSupplyGateway.findById.mockResolvedValue(null);

      await expect(supplyUseCases.updateSupply(999, updateData)).rejects.toThrow(NotFoundHttpError);
      await expect(supplyUseCases.updateSupply(999, updateData)).rejects.toThrow('Insumo');
      
      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(999);
      expect(mockSupplyGateway.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists for another supply', async () => {
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };
      const updateData = { name: 'Filtro de ar' } as Supply;
      const conflictingSupply = { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.00 };

      mockSupplyGateway.findById.mockResolvedValue(existingSupply);
      mockSupplyGateway.findByName.mockResolvedValue(conflictingSupply);

      await expect(supplyUseCases.updateSupply(1, updateData)).rejects.toThrow(ConflictError);
      await expect(supplyUseCases.updateSupply(1, updateData)).rejects.toThrow('Insumo com este nome já existe');
      
      expect(mockSupplyGateway.findByName).toHaveBeenCalledWith('Filtro de ar');
      expect(mockSupplyGateway.update).not.toHaveBeenCalled();
    });

    it('should allow updating supply with same name', async () => {
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };
      const updateData = { name: 'Filtro de óleo', quantity: 15 } as Supply;
      const sameSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 15, price: 25.50 };

      mockSupplyGateway.findById.mockResolvedValue(existingSupply);
      mockSupplyGateway.findByName.mockResolvedValue(sameSupply);
      mockSupplyGateway.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyUseCases.updateSupply(1, updateData);

      expect(result.quantity).toBe(15);
      expect(mockSupplyGateway.update).toHaveBeenCalled();
    });
  });

  describe('deleteSupply', () => {
    it('should delete a supply successfully', async () => {
      const existingSupply = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockSupplyGateway.findById.mockResolvedValue(existingSupply);
      mockSupplyGateway.delete.mockResolvedValue();

      await supplyUseCases.deleteSupply(1);

      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(1);
      expect(mockSupplyGateway.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundHttpError when supply not found', async () => {
      mockSupplyGateway.findById.mockResolvedValue(null);

      await expect(supplyUseCases.deleteSupply(999)).rejects.toThrow(NotFoundHttpError);
      await expect(supplyUseCases.deleteSupply(999)).rejects.toThrow('Insumo');
      
      expect(mockSupplyGateway.findById).toHaveBeenCalledWith(999);
      expect(mockSupplyGateway.delete).not.toHaveBeenCalled();
    });
  });
});