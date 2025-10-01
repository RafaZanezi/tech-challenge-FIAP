import { ClientController } from './client';
import { Client } from '../entities/client';
import { ClientUseCases } from '../usecases/client';
import { ClientPresenter } from '../presenters/client';
import { verifyAndReturnError } from '../presenters/verify-and-return-error';
import { ConflictError, ValidationError } from '../usecases/errors/errors';

// Mock dependencies
jest.mock('../usecases/client');
jest.mock('../presenters/client');
jest.mock('../presenters/verify-and-return-error');
jest.mock('../gateways/client');

describe('ClientController', () => {
  let clientController: ClientController;
  let mockDbConnection: any;
  let mockClientUseCase: jest.Mocked<ClientUseCases>;
  let mockClientPresenter: jest.Mocked<ClientPresenter>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockDbConnection = {};
    
    mockClientUseCase = {
      createClient: jest.fn(),
      updateClient: jest.fn(),
      findClientById: jest.fn(),
      findAllClients: jest.fn(),
      deleteClient: jest.fn(),
    } as any;

    mockClientPresenter = {
      present: jest.fn(),
      presentUpdated: jest.fn(),
      presentFound: jest.fn(),
      presentList: jest.fn(),
      presentDeleted: jest.fn(),
      getStatusCode: jest.fn().mockReturnValue(200),
      getResponse: jest.fn().mockReturnValue({ success: true }),
    } as any;

    (ClientUseCases as jest.Mock).mockImplementation(() => mockClientUseCase);
    (ClientPresenter as jest.Mock).mockImplementation(() => mockClientPresenter);

    clientController = new ClientController(mockDbConnection);

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
    it('should create a client successfully', async () => {
      const clientData = {
        name: 'João Silva',
        identifier: '11144477735'
      };
      
      mockReq.body = clientData;
      
      const mockClient = new Client(clientData, 1);
      mockClientUseCase.createClient.mockResolvedValue(mockClient);

      await clientController.create(mockReq, mockRes);

      expect(mockClientUseCase.createClient).toHaveBeenCalledWith(expect.any(Client));
      expect(mockClientPresenter.present).toHaveBeenCalledWith(mockClient);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ success: true });
    });

    it('should handle validation error', async () => {
      const clientData = {
        name: '',
        identifier: '12345678901'
      };
      
      mockReq.body = clientData;
      
      const error = new ValidationError('Nome do cliente é obrigatório');
      mockClientUseCase.createClient.mockRejectedValue(error);

      await clientController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });

    it('should handle conflict error', async () => {
      const clientData = {
        name: 'João Silva',
        identifier: '11144477735'
      };
      
      mockReq.body = clientData;
      
      const error = new ConflictError('Cliente com este identificador já existe');
      mockClientUseCase.createClient.mockRejectedValue(error);

      await clientController.create(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const updateData = {
        name: 'João Silva Atualizado',
      };
      
      mockReq.params.id = '1';
      mockReq.body = updateData;
      
      const mockClient = new Client({ name: 'João Silva Atualizado', identifier: '11144477735' }, 1);
      mockClientUseCase.updateClient.mockResolvedValue(mockClient);

      await clientController.update(mockReq, mockRes);

      expect(mockClientUseCase.updateClient).toHaveBeenCalledWith(1, updateData);
      expect(mockClientPresenter.presentUpdated).toHaveBeenCalledWith(mockClient);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle update error', async () => {
      mockReq.params.id = '999';
      mockReq.body = { name: 'Test' };
      
      const error = new Error('Cliente não encontrado');
      mockClientUseCase.updateClient.mockRejectedValue(error);

      await clientController.update(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('find', () => {
    it('should find a client by id', async () => {
      mockReq.params.id = '1';
      
      const mockClient = new Client({ name: 'João Silva', identifier: '11144477735' }, 1);
      mockClientUseCase.findClientById.mockResolvedValue(mockClient);

      await clientController.find(mockReq, mockRes);

      expect(mockClientUseCase.findClientById).toHaveBeenCalledWith('1');
      expect(mockClientPresenter.presentFound).toHaveBeenCalledWith(mockClient);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should find all clients when no id provided', async () => {
            const mockClients = [
        new Client({ name: 'João Silva', identifier: '11144477735' }, 1),
        new Client({ name: 'Maria Santos', identifier: '00000000191' }, 2)
      ];
      
      mockClientUseCase.findAllClients.mockResolvedValue(mockClients);

      await clientController.find(mockReq, mockRes);

      expect(mockClientUseCase.findAllClients).toHaveBeenCalled();
      expect(mockClientPresenter.presentList).toHaveBeenCalledWith(mockClients);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle find error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Cliente não encontrado');
      mockClientUseCase.findClientById.mockRejectedValue(error);

      await clientController.find(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });

  describe('delete', () => {
    it('should delete a client successfully', async () => {
      mockReq.params.id = '1';
      
      mockClientUseCase.deleteClient.mockResolvedValue();

      await clientController.delete(mockReq, mockRes);

      expect(mockClientUseCase.deleteClient).toHaveBeenCalledWith('1');
      expect(mockClientPresenter.presentDeleted).toHaveBeenCalledWith({ id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle delete error', async () => {
      mockReq.params.id = '999';
      
      const error = new Error('Cliente não encontrado');
      mockClientUseCase.deleteClient.mockRejectedValue(error);

      await clientController.delete(mockReq, mockRes);

      expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
    });
  });
});