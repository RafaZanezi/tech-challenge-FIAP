import { ClientGateway } from './client';
import { Client } from '../entities/client';
import { ClientDTO } from '../dtos/client';
import { PostgresConnection } from '../external/postgres/database-queries';
import { DatabaseConnection } from '../interfaces/connection';

// Mock the PostgresConnection
jest.mock('../external/postgres/database-queries');

describe('ClientGateway', () => {
  let clientGateway: ClientGateway;
  let mockDatabase: DatabaseConnection;
  let mockPostgresConnection: jest.Mocked<PostgresConnection>;

  beforeEach(() => {
    mockDatabase = {} as DatabaseConnection;
    
    mockPostgresConnection = {
      findAll: jest.fn(),
      findByParams: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    (PostgresConnection as jest.Mock).mockImplementation(() => mockPostgresConnection);
    
    clientGateway = new ClientGateway(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all clients', async () => {
      const mockClients: ClientDTO[] = [
        { id: 1, name: 'João Silva', identifier: '11144477735' },
        { id: 2, name: 'Maria Santos', identifier: '00000000191' }
      ];

      mockPostgresConnection.findAll.mockResolvedValue(mockClients);

      const result = await clientGateway.findAll();

      expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('clients', null);
      expect(result).toEqual(mockClients);
    });

    it('should return empty array when no clients found', async () => {
      mockPostgresConnection.findAll.mockResolvedValue([]);

      const result = await clientGateway.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a client by id', async () => {
      const mockClient: ClientDTO = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockPostgresConnection.findByParams.mockResolvedValue(mockClient);

      const result = await clientGateway.findById(1);

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('clients', null, { id: 1 });
      expect(result).toEqual(mockClient);
    });

    it('should return null when client not found', async () => {
      mockPostgresConnection.findByParams.mockResolvedValue(null);

      const result = await clientGateway.findById(999);

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('clients', null, { id: 999 });
      expect(result).toBeNull();
    });
  });

  describe('findByIdentifier', () => {
    it('should find a client by identifier', async () => {
      const mockClient: ClientDTO = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockPostgresConnection.findByParams.mockResolvedValue(mockClient);

      const result = await clientGateway.findByIdentifier('11144477735');

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('clients', null, { identifier: '11144477735' });
      expect(result).toEqual(mockClient);
    });

    it('should return null when client with identifier not found', async () => {
      mockPostgresConnection.findByParams.mockResolvedValue(null);

      const result = await clientGateway.findByIdentifier('33355577799');

      expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('clients', null, { identifier: '33355577799' });
      expect(result).toBeNull();
    });
  });

  describe('insert', () => {
    it('should insert a new client', async () => {
      const client = new Client({
        name: 'João Silva',
        identifier: '11144477735'
      });

      const mockInsertResult: ClientDTO = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockPostgresConnection.insert.mockResolvedValue(mockInsertResult);

      const result = await clientGateway.insert(client);

      expect(mockPostgresConnection.insert).toHaveBeenCalledWith('clients', client);
      expect(result).toEqual(mockInsertResult);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateData = { name: 'João Silva Atualizado' };
      const mockUpdateResult: ClientDTO = { id: 1, name: 'João Silva Atualizado', identifier: '11144477735' };

      mockPostgresConnection.update.mockResolvedValue(mockUpdateResult);

      const result = await clientGateway.update(1, updateData);

      expect(mockPostgresConnection.update).toHaveBeenCalledWith('clients', 1, updateData);
      expect(result).toEqual(mockUpdateResult);
    });

    it('should update a client with partial data', async () => {
      const updateData = { 
        name: 'João Silva Atualizado',
        identifier: '11111111111'
      };
      const mockUpdateResult: ClientDTO = { 
        id: 1, 
        name: 'João Silva Atualizado', 
        identifier: '11111111111' 
      };

      mockPostgresConnection.update.mockResolvedValue(mockUpdateResult);

      const result = await clientGateway.update(1, updateData);

      expect(mockPostgresConnection.update).toHaveBeenCalledWith('clients', 1, updateData);
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      mockPostgresConnection.delete.mockResolvedValue();

      await clientGateway.delete(1);

      expect(mockPostgresConnection.delete).toHaveBeenCalledWith('clients', 1);
    });
  });

  describe('constructor', () => {
    it('should create PostgresConnection with provided database', () => {
      const database = {} as DatabaseConnection;
      
      new ClientGateway(database);

      expect(PostgresConnection).toHaveBeenCalledWith(database);
    });
  });
});