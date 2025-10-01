import { ClientUseCases } from './client';
import { Client } from '../entities/client';
import { ClientGatewayInterface } from '../interfaces/gateways';
import { ConflictError } from './errors/errors';
import { NotFoundHttpError } from '../api/errors/http-errors';

describe('ClientUseCases', () => {
  let clientUseCases: ClientUseCases;
  let mockClientGateway: jest.Mocked<ClientGatewayInterface>;

  beforeEach(() => {
    mockClientGateway = {
      insert: jest.fn(),
      findById: jest.fn(),
      findByIdentifier: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    clientUseCases = new ClientUseCases(mockClientGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClient', () => {
    it('should create a client successfully', async () => {
      const clientData = {
        name: 'João Silva',
        identifier: '11144477735' // CPF válido
      };

      const client = new Client(clientData);
      const savedClientDTO = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockClientGateway.findByIdentifier.mockResolvedValue(null);
      mockClientGateway.insert.mockResolvedValue(savedClientDTO);

      const result = await clientUseCases.createClient(client);

      expect(mockClientGateway.findByIdentifier).toHaveBeenCalledWith('11144477735');
      expect(mockClientGateway.insert).toHaveBeenCalledWith(client);
      expect(result).toBeInstanceOf(Client);
      expect(result.id).toBe(1);
      expect(result.name).toBe('João Silva');
      expect(result.identifier).toBe('11144477735');
    });

    it('should throw ConflictError when client with same identifier exists', async () => {
      const clientData = {
        name: 'João Silva',
        identifier: '11144477735'
      };

      const client = new Client(clientData);
      const existingClient = { id: 1, name: 'Maria Santos', identifier: '11144477735' };

      mockClientGateway.findByIdentifier.mockResolvedValue(existingClient);

      await expect(clientUseCases.createClient(client)).rejects.toThrow(ConflictError);
      await expect(clientUseCases.createClient(client)).rejects.toThrow('Cliente com este identificador já existe');
      
      expect(mockClientGateway.findByIdentifier).toHaveBeenCalledWith('11144477735');
      expect(mockClientGateway.insert).not.toHaveBeenCalled();
    });
  });

  describe('findClientById', () => {
    it('should find a client by id successfully', async () => {
      const clientDTO = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockClientGateway.findById.mockResolvedValue(clientDTO);

      const result = await clientUseCases.findClientById(1);

      expect(mockClientGateway.findById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(Client);
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('João Silva');
      expect(result!.identifier).toBe('11144477735');
    });

    it('should throw NotFoundHttpError when client not found', async () => {
      mockClientGateway.findById.mockResolvedValue(null);

      await expect(clientUseCases.findClientById(999)).rejects.toThrow(NotFoundHttpError);
      await expect(clientUseCases.findClientById(999)).rejects.toThrow('Cliente');
      
      expect(mockClientGateway.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findAllClients', () => {
    it('should find all clients successfully', async () => {
      const clientsDTO = [
        { id: 1, name: 'João Silva', identifier: '11144477735' },
        { id: 2, name: 'Maria Santos', identifier: '00000000191' }
      ];

      mockClientGateway.findAll.mockResolvedValue(clientsDTO);

      const result = await clientUseCases.findAllClients();

      expect(mockClientGateway.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Client);
      expect(result[0].name).toBe('João Silva');
      expect(result[1]).toBeInstanceOf(Client);
      expect(result[1].name).toBe('Maria Santos');
    });

    it('should return empty array when no clients found', async () => {
      mockClientGateway.findAll.mockResolvedValue([]);

      const result = await clientUseCases.findAllClients();

      expect(result).toEqual([]);
      expect(mockClientGateway.findAll).toHaveBeenCalled();
    });
  });

  describe('updateClient', () => {
    it('should update a client successfully', async () => {
      const existingClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
      const updateData = { name: 'João Silva Atualizado', identifier: '11144477735' } as Client;
      const updatedClientDTO = { id: 1, name: 'João Silva Atualizado', identifier: '11144477735' };

      mockClientGateway.findById.mockResolvedValue(existingClient);
      mockClientGateway.findByIdentifier.mockResolvedValue(null);
      mockClientGateway.update.mockResolvedValue(updatedClientDTO);

      const result = await clientUseCases.updateClient(1, updateData);

      expect(mockClientGateway.findById).toHaveBeenCalledWith(1);
      expect(mockClientGateway.update).toHaveBeenCalledWith(1, { 
        name: 'João Silva Atualizado', 
        identifier: '11144477735' 
      });
      expect(result).toBeInstanceOf(Client);
      expect(result.name).toBe('João Silva Atualizado');
    });

    it('should update client without changing identifier', async () => {
      const existingClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
      const updateData = { name: 'João Silva Atualizado' } as Client;
      const updatedClientDTO = { id: 1, name: 'João Silva Atualizado', identifier: '11144477735' };

      mockClientGateway.findById.mockResolvedValue(existingClient);
      mockClientGateway.update.mockResolvedValue(updatedClientDTO);

      const result = await clientUseCases.updateClient(1, updateData);

      expect(mockClientGateway.update).toHaveBeenCalledWith(1, { 
        name: 'João Silva Atualizado', 
        identifier: '11144477735' 
      });
      expect(result.name).toBe('João Silva Atualizado');
      expect(result.identifier).toBe('11144477735');
    });

    it('should throw NotFoundHttpError when client not found', async () => {
      const updateData = { name: 'João Silva' } as Client;

      mockClientGateway.findById.mockResolvedValue(null);

      await expect(clientUseCases.updateClient(999, updateData)).rejects.toThrow(NotFoundHttpError);
      await expect(clientUseCases.updateClient(999, updateData)).rejects.toThrow('Cliente');
      
      expect(mockClientGateway.findById).toHaveBeenCalledWith(999);
      expect(mockClientGateway.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new identifier already exists for another client', async () => {
      const existingClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
      const updateData = { identifier: '00000000191' } as Client;
      const conflictingClient = { id: 2, name: 'Maria Santos', identifier: '00000000191' };

      mockClientGateway.findById.mockResolvedValue(existingClient);
      mockClientGateway.findByIdentifier.mockResolvedValue(conflictingClient);

      await expect(clientUseCases.updateClient(1, updateData)).rejects.toThrow(ConflictError);
      await expect(clientUseCases.updateClient(1, updateData)).rejects.toThrow('Cliente com este identificador já existe');
      
      expect(mockClientGateway.findByIdentifier).toHaveBeenCalledWith('00000000191');
      expect(mockClientGateway.update).not.toHaveBeenCalled();
    });

    it('should allow updating client with same identifier', async () => {
      const existingClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
      const updateData = { identifier: '11144477735', name: 'João Silva Atualizado' } as Client;
      const sameClient = { id: 1, name: 'João Silva', identifier: '11144477735' };
      const updatedClientDTO = { id: 1, name: 'João Silva Atualizado', identifier: '11144477735' };

      mockClientGateway.findById.mockResolvedValue(existingClient);
      mockClientGateway.findByIdentifier.mockResolvedValue(sameClient);
      mockClientGateway.update.mockResolvedValue(updatedClientDTO);

      const result = await clientUseCases.updateClient(1, updateData);

      expect(result.name).toBe('João Silva Atualizado');
      expect(mockClientGateway.update).toHaveBeenCalled();
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      const existingClient = { id: 1, name: 'João Silva', identifier: '11144477735' };

      mockClientGateway.findById.mockResolvedValue(existingClient);
      mockClientGateway.delete.mockResolvedValue();

      await clientUseCases.deleteClient(1);

      expect(mockClientGateway.findById).toHaveBeenCalledWith(1);
      expect(mockClientGateway.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundHttpError when client not found', async () => {
      mockClientGateway.findById.mockResolvedValue(null);

      await expect(clientUseCases.deleteClient(999)).rejects.toThrow(NotFoundHttpError);
      await expect(clientUseCases.deleteClient(999)).rejects.toThrow('Cliente');
      
      expect(mockClientGateway.findById).toHaveBeenCalledWith(999);
      expect(mockClientGateway.delete).not.toHaveBeenCalled();
    });
  });
});