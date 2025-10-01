import { SupplyGateway } from './supply';
import { Supply } from '../entities/supply';
import { PostgresConnection } from '../external/postgres/database-queries';
import { DatabaseConnection } from '../interfaces/connection';

// Mock the PostgresConnection
jest.mock('../external/postgres/database-queries');

describe('SupplyGateway', () => {
  let supplyGateway: SupplyGateway;
  let mockPostgresConnection: jest.Mocked<PostgresConnection>;
  let mockDatabaseConnection: DatabaseConnection;

  beforeEach(() => {
    mockDatabaseConnection = {} as DatabaseConnection;

    mockPostgresConnection = {
      findAll: jest.fn(),
      findByParams: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    (PostgresConnection as jest.MockedClass<typeof PostgresConnection>).mockImplementation(() => mockPostgresConnection);

    supplyGateway = new SupplyGateway(mockDatabaseConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all supplies', async () => {
      const suppliesDTO = [
        { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 },
        { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.00 }
      ];

      mockPostgresConnection.findAll.mockResolvedValue(suppliesDTO);

      const result = await supplyGateway.findAll();

      expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('supplies', null);
      expect(result).toEqual(suppliesDTO);
    });

    it('should return empty array when no supplies found', async () => {
      mockPostgresConnection.findAll.mockResolvedValue([]);

      const result = await supplyGateway.findAll();

      expect(result).toEqual([]);
      expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('supplies', null);
    });
  });

  describe('findById', () => {
    it('should find supply by id', async () => {
      const supplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockPostgresConnection.findByParams.mockResolvedValue(supplyDTO);

      const result = await supplyGateway.findById(1);

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('supplies', null, { id: 1 });
      expect(result).toEqual(supplyDTO);
    });

    it('should return null when supply not found by id', async () => {
      mockPostgresConnection.findByParams.mockResolvedValue(null);

      const result = await supplyGateway.findById(999);

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('supplies', null, { id: 999 });
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find supply by name', async () => {
      const supplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockPostgresConnection.findByParams.mockResolvedValue(supplyDTO);

      const result = await supplyGateway.findByName('Filtro de óleo');

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('supplies', null, { name: 'Filtro de óleo' });
      expect(result).toEqual(supplyDTO);
    });

    it('should return null when supply not found by name', async () => {
      mockPostgresConnection.findByParams.mockResolvedValue(null);

      const result = await supplyGateway.findByName('Nome inexistente');

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('supplies', null, { name: 'Nome inexistente' });
      expect(result).toBeNull();
    });

    it('should handle special characters in name search', async () => {
      const supplyDTO = { id: 1, name: 'Óleo 5W-30', quantity: 8, price: 45.90 };

      mockPostgresConnection.findByParams.mockResolvedValue(supplyDTO);

      const result = await supplyGateway.findByName('Óleo 5W-30');

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('supplies', null, { name: 'Óleo 5W-30' });
      expect(result).toEqual(supplyDTO);
    });
  });

  describe('insert', () => {
    it('should insert a supply', async () => {
      const supply = new Supply({ name: 'Filtro de óleo', quantity: 10, price: 25.50 });
      const insertedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 };

      mockPostgresConnection.insert.mockResolvedValue(insertedSupplyDTO);

      const result = await supplyGateway.insert(supply);

      expect(mockPostgresConnection.insert).toHaveBeenCalledWith('supplies', supply);
      expect(result).toEqual(insertedSupplyDTO);
    });

    it('should insert supply with decimal price', async () => {
      const supply = new Supply({ name: 'Pastilha de freio', quantity: 4, price: 85.75 });
      const insertedSupplyDTO = { id: 2, name: 'Pastilha de freio', quantity: 4, price: 85.75 };

      mockPostgresConnection.insert.mockResolvedValue(insertedSupplyDTO);

      const result = await supplyGateway.insert(supply);

      expect(mockPostgresConnection.insert).toHaveBeenCalledWith('supplies', supply);
      expect(result).toEqual(insertedSupplyDTO);
    });
  });

  describe('update', () => {
    it('should update a supply', async () => {
      const updateData = { name: 'Filtro de óleo premium', quantity: 15, price: 35.00 };
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo premium', quantity: 15, price: 35.00 };

      mockPostgresConnection.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyGateway.update(1, updateData);

      expect(mockPostgresConnection.update).toHaveBeenCalledWith('supplies', 1, updateData);
      expect(result).toEqual(updatedSupplyDTO);
    });

    it('should update partial supply data', async () => {
      const updateData = { quantity: 20 };
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 20, price: 25.50 };

      mockPostgresConnection.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyGateway.update(1, updateData);

      expect(mockPostgresConnection.update).toHaveBeenCalledWith('supplies', 1, updateData);
      expect(result).toEqual(updatedSupplyDTO);
    });

    it('should update only price', async () => {
      const updateData = { price: 30.99 };
      const updatedSupplyDTO = { id: 1, name: 'Filtro de óleo', quantity: 10, price: 30.99 };

      mockPostgresConnection.update.mockResolvedValue(updatedSupplyDTO);

      const result = await supplyGateway.update(1, updateData);

      expect(mockPostgresConnection.update).toHaveBeenCalledWith('supplies', 1, updateData);
      expect(result).toEqual(updatedSupplyDTO);
    });
  });

  describe('delete', () => {
    it('should delete a supply', async () => {
      mockPostgresConnection.delete.mockResolvedValue();

      await supplyGateway.delete(1);

      expect(mockPostgresConnection.delete).toHaveBeenCalledWith('supplies', 1);
    });

    it('should delete supply with different id', async () => {
      mockPostgresConnection.delete.mockResolvedValue();

      await supplyGateway.delete(999);

      expect(mockPostgresConnection.delete).toHaveBeenCalledWith('supplies', 999);
    });
  });
});