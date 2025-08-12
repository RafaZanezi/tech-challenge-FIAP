import { Request, Response } from 'express';
import SupplyController from './supply.controller';
import { CreateSupplyUseCase } from '../../application/use-cases/create-supply.use-case';
import { FindSupplyUseCase } from '../../application/use-cases/find-supply.use-case';
import { FindAllSuppliesUseCase } from '../../application/use-cases/find-all-supplies.use-case';
import { UpdateSupplyUseCase } from '../../application/use-cases/update-supply.use-case';
import { DeleteSupplyUseCase } from '../../application/use-cases/delete-supply.use-case';

// Mock dos use cases
const mockCreateSupplyUseCase = {
    execute: jest.fn()
} as unknown as CreateSupplyUseCase;

const mockFindSupplyUseCase = {
    execute: jest.fn()
} as unknown as FindSupplyUseCase;

const mockFindAllSuppliesUseCase = {
    execute: jest.fn()
} as unknown as FindAllSuppliesUseCase;

const mockUpdateSupplyUseCase = {
    execute: jest.fn()
} as unknown as UpdateSupplyUseCase;

const mockDeleteSupplyUseCase = {
    execute: jest.fn()
} as unknown as DeleteSupplyUseCase;

describe('SupplyController', () => {
    let controller: SupplyController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        controller = new SupplyController(
            mockCreateSupplyUseCase,
            mockUpdateSupplyUseCase,
            mockFindAllSuppliesUseCase,
            mockFindSupplyUseCase,
            mockDeleteSupplyUseCase
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
        it('should create supply successfully', async () => {
            const supplyData = {
                name: 'Test Supply',
                description: 'Test Description',
                cost: 50
            };
            req.body = supplyData;

            const mockResult = { id: 1, ...supplyData };
            (mockCreateSupplyUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.create(req as Request, res as Response);

            expect(mockCreateSupplyUseCase.execute).toHaveBeenCalledWith(supplyData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult
            });
        });

        it('should handle create error', async () => {
            const error = new Error('Create failed');
            (mockCreateSupplyUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Create failed'
            });
        });
    });

    describe('find (findAll)', () => {
        it('should find all supplies successfully when no id provided', async () => {
            const mockSupplies = [
                { id: 1, name: 'Supply 1', description: 'Desc 1', cost: 50 },
                { id: 2, name: 'Supply 2', description: 'Desc 2', cost: 75 }
            ];
            (mockFindAllSuppliesUseCase.execute as jest.Mock).mockResolvedValue(mockSupplies);

            await controller.find(req as Request, res as Response);

            expect(mockFindAllSuppliesUseCase.execute).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSupplies
            });
        });

        it('should handle findAll error', async () => {
            const error = new Error('Find all failed');
            (mockFindAllSuppliesUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find all failed'
            });
        });
    });

    describe('find (findById)', () => {
        it('should find supply by id successfully', async () => {
            const supplyId = '1';
            req.params = { id: supplyId };

            const mockSupply = { id: 1, name: 'Supply 1', description: 'Desc 1', cost: 50 };
            (mockFindSupplyUseCase.execute as jest.Mock).mockResolvedValue(mockSupply);

            await controller.find(req as Request, res as Response);

            expect(mockFindSupplyUseCase.execute).toHaveBeenCalledWith({ id: 1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSupply
            });
        });

        it('should handle findById error', async () => {
            req.params = { id: '1' };
            const error = new Error('Find by id failed');
            (mockFindSupplyUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.find(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Find by id failed'
            });
        });
    });

    describe('update', () => {
        it('should update supply successfully', async () => {
            const supplyId = '1';
            const updateData = { name: 'Updated Supply', cost: 60 };
            req.params = { id: supplyId };
            req.body = updateData;

            const mockResult = { id: 1, ...updateData };
            (mockUpdateSupplyUseCase.execute as jest.Mock).mockResolvedValue(mockResult);

            await controller.update(req as Request, res as Response);

            expect(mockUpdateSupplyUseCase.execute).toHaveBeenCalledWith({ id: 1, ...updateData });
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
            (mockUpdateSupplyUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.update(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Update failed'
            });
        });
    });

    describe('delete', () => {
        it('should delete supply successfully', async () => {
            const supplyId = '1';
            req.params = { id: supplyId };

            (mockDeleteSupplyUseCase.execute as jest.Mock).mockResolvedValue(undefined);

            await controller.delete(req as Request, res as Response);

            expect(mockDeleteSupplyUseCase.execute).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Insumo deletado com sucesso'
            });
        });

        it('should handle delete error', async () => {
            req.params = { id: '1' };
            const error = new Error('Delete failed');
            (mockDeleteSupplyUseCase.execute as jest.Mock).mockRejectedValue(error);

            await controller.delete(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Delete failed'
            });
        });
    });
});
