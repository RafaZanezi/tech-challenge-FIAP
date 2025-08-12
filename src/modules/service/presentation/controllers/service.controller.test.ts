import { Request, Response } from 'express';
import ServiceController from './service.controller';
import { CreateServiceUseCase } from '../../application/use-cases/create-service.use-case';
import { FindServiceUseCase } from '../../application/use-cases/find-service.use-case';
import { FindAllServicesUseCase } from '../../application/use-cases/find-all-services.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/delete-service.use-case';

// Mock dos use cases
const mockCreateServiceUseCase = {
    execute: jest.fn()
} as unknown as CreateServiceUseCase;

const mockFindServiceUseCase = {
    execute: jest.fn()
} as unknown as FindServiceUseCase;

const mockFindAllServicesUseCase = {
    execute: jest.fn()
} as unknown as FindAllServicesUseCase;

const mockUpdateServiceUseCase = {
    execute: jest.fn()
} as unknown as UpdateServiceUseCase;

const mockDeleteServiceUseCase = {
    execute: jest.fn()
} as unknown as DeleteServiceUseCase;

describe('ServiceController', () => {
    let controller: ServiceController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        controller = new ServiceController(
            mockCreateServiceUseCase,
            mockUpdateServiceUseCase,
            mockFindAllServicesUseCase,
            mockFindServiceUseCase,
            mockDeleteServiceUseCase
        );

        req = {
            body: {},
            params: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create service successfully', async () => {
            const serviceData = {
                name: 'Test Service',
                description: 'Test Description',
                cost: 100
            };
            req.body = serviceData;

            const mockResult = { id: 1, ...serviceData };
            (mockCreateServiceUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.create(req as Request, res as Response);

            expect(mockCreateServiceUseCase.execute).toHaveBeenCalledWith(serviceData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult
            });
        });

        it('should handle create error', async () => {
            const error = new Error('Create failed');
            (mockCreateServiceUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Create failed'
            });
        });
    });

    describe('find (findAll)', () => {
        it('should find all services successfully when no id provided', async () => {
            const mockServices = [
                { id: 1, name: 'Service 1', description: 'Desc 1', cost: 100 },
                { id: 2, name: 'Service 2', description: 'Desc 2', cost: 200 }
            ];
            (mockFindAllServicesUseCase.execute as jest.Mock).mockResolvedValue(mockServices);

            await controller.find(req as Request, res as Response);

            expect(mockFindAllServicesUseCase.execute).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockServices
            });
        });

        it('should handle findAll error', async () => {
            const error = new Error('Find all failed');
            (mockFindAllServicesUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find all failed'
            });
        });
    });

    describe('find (findById)', () => {
        it('should find service by id successfully', async () => {
            const serviceId = '1';
            req.params = { id: serviceId };

            const mockService = { id: 1, name: 'Service 1', description: 'Desc 1', cost: 100 };
            (mockFindServiceUseCase.execute as jest.Mock).mockResolvedValue(mockService);

            await controller.find(req as Request, res as Response);

            expect(mockFindServiceUseCase.execute).toHaveBeenCalledWith({ id: 1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockService
            });
        });

        it('should handle findById error', async () => {
            req.params = { id: '1' };
            const error = new Error('Find by id failed');
            (mockFindServiceUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find by id failed'
            });
        });
    });

    describe('update', () => {
        it('should update service successfully', async () => {
            const serviceId = '1';
            const updateData = { name: 'Updated Service', cost: 150 };
            req.params = { id: serviceId };
            req.body = updateData;

            const mockResult = { id: 1, ...updateData };
            (mockUpdateServiceUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.update(req as Request, res as Response);

            expect(mockUpdateServiceUseCase.execute).toHaveBeenCalledWith({ id: 1, ...updateData });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult
            });
        });

        it('should handle update error', async () => {
            req.params = { id: '1' };
            req.body = { name: 'Updated' };
            const error = new Error('Update failed');
            (mockUpdateServiceUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.update(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Update failed'
            });
        });
    });

    describe('delete', () => {
        it('should delete service successfully', async () => {
            const serviceId = '1';
            req.params = { id: serviceId };

            (mockDeleteServiceUseCase.execute as jest.Mock).mockResolvedValue(undefined);

            await controller.delete(req as Request, res as Response);

            expect(mockDeleteServiceUseCase.execute).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Serviço deletado com sucesso'
            });
        });

        it('should handle delete error', async () => {
            req.params = { id: '1' };
            const error = new Error('Delete failed');
            (mockDeleteServiceUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.delete(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Delete failed'
            });
        });
    });
});
