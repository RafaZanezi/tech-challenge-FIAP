import { Request, Response } from 'express';
import VehicleController from './vehicle.controller';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { FindVehicleUseCase } from '../../application/use-cases/find-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../../application/use-cases/find-all-vehicles.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';

// Mock dos use cases
const mockCreateVehicleUseCase = {
    execute: jest.fn()
} as unknown as CreateVehicleUseCase;

const mockFindVehicleUseCase = {
    execute: jest.fn()
} as unknown as FindVehicleUseCase;

const mockFindAllVehiclesUseCase = {
    execute: jest.fn()
} as unknown as FindAllVehiclesUseCase;

const mockUpdateVehicleUseCase = {
    execute: jest.fn()
} as unknown as UpdateVehicleUseCase;

const mockDeleteVehicleUseCase = {
    execute: jest.fn()
} as unknown as DeleteVehicleUseCase;

describe('VehicleController', () => {
    let controller: VehicleController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        controller = new VehicleController(
            mockCreateVehicleUseCase,
            mockUpdateVehicleUseCase,
            mockFindAllVehiclesUseCase,
            mockFindVehicleUseCase,
            mockDeleteVehicleUseCase
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
        it('should create vehicle successfully', async () => {
            const vehicleData = {
                model: 'Test Vehicle',
                brand: 'Test Brand',
                year: 2023,
                plate: 'ABC-1234'
            };
            req.body = vehicleData;

            const mockResult = { id: 1, ...vehicleData };
            (mockCreateVehicleUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.create(req as Request, res as Response);

            expect(mockCreateVehicleUseCase.execute).toHaveBeenCalledWith(vehicleData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult
            });
        });

        it('should handle create error with status code', async () => {
            const error = { statusCode: 400, message: 'Create failed' };
            (mockCreateVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Create failed'
            });
        });

        it('should handle create error without status code', async () => {
            const error = new Error('Create failed');
            (mockCreateVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Create failed'
            });
        });

        it('should handle create error without message', async () => {
            const error = {};
            (mockCreateVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ocorreu um erro ao processar'
            });
        });
    });

    describe('find (findAll)', () => {
        it('should find all vehicles successfully when no id provided', async () => {
            const mockVehicles = [
                { id: 1, model: 'Vehicle 1', brand: 'Brand 1', year: 2023, plate: 'ABC-1234' },
                { id: 2, model: 'Vehicle 2', brand: 'Brand 2', year: 2024, plate: 'DEF-5678' }
            ];
            (mockFindAllVehiclesUseCase.execute as jest.Mock).mockResolvedValue(mockVehicles);

            await controller.find(req as Request, res as Response);

            expect(mockFindAllVehiclesUseCase.execute).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockVehicles
            });
        });

        it('should handle findAll error', async () => {
            const error = { statusCode: 404, message: 'Find all failed' };
            (mockFindAllVehiclesUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find all failed'
            });
        });
    });

    describe('find (findById)', () => {
        it('should find vehicle by id successfully', async () => {
            const vehicleId = '1';
            req.params = { id: vehicleId };

            const mockVehicle = { id: 1, model: 'Vehicle 1', brand: 'Brand 1', year: 2023, plate: 'ABC-1234' };
            (mockFindVehicleUseCase.execute as jest.Mock).mockResolvedValue(mockVehicle);

            await controller.find(req as Request, res as Response);

            expect(mockFindVehicleUseCase.execute).toHaveBeenCalledWith({ id: 1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockVehicle
            });
        });

        it('should handle findById error', async () => {
            req.params = { id: '1' };
            const error = { statusCode: 404, message: 'Find by id failed' };
            (mockFindVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find by id failed'
            });
        });
    });

    describe('update', () => {
        it('should update vehicle successfully', async () => {
            const vehicleId = '1';
            const updateData = { model: 'Updated Vehicle', year: 2024 };
            req.params = { id: vehicleId };
            req.body = updateData;

            const mockResult = { id: 1, ...updateData };
            (mockUpdateVehicleUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.update(req as Request, res as Response);

            expect(mockUpdateVehicleUseCase.execute).toHaveBeenCalledWith({ id: 1, ...updateData });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult
            });
        });

        it('should handle update error with status code', async () => {
            req.params = { id: '1' };
            req.body = { model: 'Updated' };
            const error = { statusCode: 400, message: 'Update failed' };
            (mockUpdateVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.update(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Update failed'
            });
        });

        it('should handle update error without status code', async () => {
            req.params = { id: '1' };
            req.body = { model: 'Updated' };
            const error = new Error('Update failed');
            (mockUpdateVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.update(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Update failed'
            });
        });
    });

    describe('delete', () => {
        it('should delete vehicle successfully', async () => {
            const vehicleId = '1';
            req.params = { id: vehicleId };

            (mockDeleteVehicleUseCase.execute as jest.Mock).mockResolvedValue(undefined);

            await controller.delete(req as Request, res as Response);

            expect(mockDeleteVehicleUseCase.execute).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Veículo deletado com sucesso'
            });
        });

        it('should handle delete error with status code', async () => {
            req.params = { id: '1' };
            const error = { statusCode: 404, message: 'Delete failed' };
            (mockDeleteVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.delete(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Delete failed'
            });
        });

        it('should handle delete error without status code', async () => {
            req.params = { id: '1' };
            const error = new Error('Delete failed');
            (mockDeleteVehicleUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.delete(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Delete failed'
            });
        });
    });
});
