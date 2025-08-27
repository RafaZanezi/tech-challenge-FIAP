import ClientController from './client.controller';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from '../../application/use-cases/update-client.use-case';
import { FindAllClientsUseCase } from '../../application/use-cases/find-all-clients.use-case';
import { FindClientsUseCase } from '../../application/use-cases/find-client.use-case';
import { DeleteClientUseCase } from '../../application/use-cases/delete-client.use-case';

describe('ClientController', () => {
    let controller: ClientController;
    let mockCreateClientUseCase: jest.Mocked<CreateClientUseCase>;
    let mockUpdateClientUseCase: jest.Mocked<UpdateClientUseCase>;
    let mockFindAllClientsUseCase: jest.Mocked<FindAllClientsUseCase>;
    let mockFindClientUseCase: jest.Mocked<FindClientsUseCase>;
    let mockDeleteClientUseCase: jest.Mocked<DeleteClientUseCase>;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        mockCreateClientUseCase = {
            execute: jest.fn(),
        } as any;

        mockUpdateClientUseCase = {
            execute: jest.fn(),
        } as any;

        mockFindAllClientsUseCase = {
            execute: jest.fn(),
        } as any;

        mockFindClientUseCase = {
            execute: jest.fn(),
        } as any;

        mockDeleteClientUseCase = {
            execute: jest.fn(),
        } as any;

        controller = new ClientController(
            mockCreateClientUseCase,
            mockUpdateClientUseCase,
            mockFindAllClientsUseCase,
            mockFindClientUseCase,
            mockDeleteClientUseCase
        );

        mockReq = {
            body: {},
            params: {},
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('create', () => {
        it('should create client successfully', async () => {
            const clientData = {
                name: 'John Doe',
                identifier: '11144477735',
            };

            const responseData = {
                id: 1,
                name: 'John Doe',
                identifier: '11144477735',
            };

            mockReq.body = clientData;
            mockCreateClientUseCase.execute.mockResolvedValue(responseData);

            await controller.create(mockReq, mockRes);

            expect(mockCreateClientUseCase.execute).toHaveBeenCalledWith(clientData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: responseData,
            });
        });

        it('should handle errors with statusCode', async () => {
            const error = {
                statusCode: 400,
                message: 'Invalid data',
            };

            mockCreateClientUseCase.execute.mockRejectedValue(error);

            await controller.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid data',
            });
        });

        it('should handle errors without statusCode', async () => {
            const error = new Error('Database error');

            mockCreateClientUseCase.execute.mockRejectedValue(error);

            await controller.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Database error',
            });
        });

        it('should handle errors without message', async () => {
            const error = {};

            mockCreateClientUseCase.execute.mockRejectedValue(error);

            await controller.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ocorreu um erro ao processar',
            });
        });
    });

    describe('update', () => {
        it('should update client successfully', async () => {
            const updateData = {
                name: 'Jane Doe',
            };

            const responseData = {
                id: 1,
                name: 'Jane Doe',
                identifier: '11144477735',
            };

            mockReq.body = updateData;
            mockReq.params.id = '1';
            mockUpdateClientUseCase.execute.mockResolvedValue(responseData);

            await controller.update(mockReq, mockRes);

            expect(mockUpdateClientUseCase.execute).toHaveBeenCalledWith({
                ...updateData,
                id: 1,
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: responseData,
            });
        });

        it('should handle update errors', async () => {
            const error = {
                statusCode: 404,
                message: 'Client not found',
            };

            mockReq.params.id = '999';
            mockUpdateClientUseCase.execute.mockRejectedValue(error);

            await controller.update(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Client not found',
            });
        });
    });

    describe('find', () => {
        it('should find client by id successfully', async () => {
            const responseData = {
                id: 1,
                name: 'John Doe',
                identifier: '11144477735',
            };

            mockReq.params.id = '1';
            mockFindClientUseCase.execute.mockResolvedValue(responseData);

            await controller.find(mockReq, mockRes);

            expect(mockFindClientUseCase.execute).toHaveBeenCalledWith({ id: '1' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: responseData,
            });
        });

        it('should find all clients when no id provided', async () => {
            const responseData = [
                {
                    id: 1,
                    name: 'John Doe',
                    identifier: '11144477735',
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    identifier: '52998224725',
                },
            ];

            mockReq.params.id = undefined;
            mockFindAllClientsUseCase.execute.mockResolvedValue(responseData);

            await controller.find(mockReq, mockRes);

            expect(mockFindAllClientsUseCase.execute).toHaveBeenCalledWith();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: responseData,
            });
        });

        it('should handle find errors', async () => {
            const error = {
                statusCode: 404,
                message: 'Client not found',
            };

            mockReq.params.id = '999';
            mockFindClientUseCase.execute.mockRejectedValue(error);

            await controller.find(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Client not found',
            });
        });
    });

    describe('delete', () => {
        it('should delete client successfully', async () => {
            mockReq.params.id = '1';
            mockDeleteClientUseCase.execute.mockResolvedValue(undefined);

            await controller.delete(mockReq, mockRes);

            expect(mockDeleteClientUseCase.execute).toHaveBeenCalledWith({ id: 1 });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Cliente deletado com sucesso',
            });
        });

        it('should handle delete errors', async () => {
            const error = {
                statusCode: 404,
                message: 'Client not found',
            };

            mockReq.params.id = '999';
            mockDeleteClientUseCase.execute.mockRejectedValue(error);

            await controller.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Client not found',
            });
        });
    });
});
