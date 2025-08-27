import { UpdateServicesAndSuppliesUseCase } from './update-services-and-supplies.use-case';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';

describe('UpdateServicesAndSuppliesUseCase', () => {
    let serviceOrderRepository: any;
    let servicesRepository: any;
    let suppliesRepository: any;
    let useCase: UpdateServicesAndSuppliesUseCase;

    beforeEach(() => {
        serviceOrderRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        servicesRepository = {
            findById: jest.fn(),
        };
        suppliesRepository = {
            findById: jest.fn(),
        };
        useCase = new UpdateServicesAndSuppliesUseCase(
            serviceOrderRepository,
            servicesRepository,
            suppliesRepository
        );
    });

    const mockServiceOrder = {
        id: 1,
        clientId: 2,
        vehicleId: 3,
        services: [{ id: 10 }],
        supplies: [{ id: 20 }],
        createdAt: new Date(),
        finalizedAt: null,
        status: 'pending',
        updateServices: jest.fn(),
        updateSupplies: jest.fn(),
    };

    const mockService = { id: 10 };
    const mockSupply = { id: 20 };

    it('should throw NotFoundError if service order does not exist', async () => {
        serviceOrderRepository.findById.mockResolvedValue(null);
        await expect(
            useCase.execute({ id: 1, services: [10], supplies: [20] })
        ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if a service does not exist', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValueOnce(null);
        suppliesRepository.findById.mockResolvedValue(mockSupply);

        await expect(
            useCase.execute({ id: 1, services: [10], supplies: [20] })
        ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if second service does not exist in multiple services', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById
            .mockResolvedValueOnce(mockService) // first service exists
            .mockResolvedValueOnce(null); // second service doesn't exist
        suppliesRepository.findById.mockResolvedValue(mockSupply);

        await expect(
            useCase.execute({ id: 1, services: [10, 11], supplies: [20] })
        ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if a supply does not exist', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValue(mockService);
        suppliesRepository.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute({ id: 1, services: [10], supplies: [20] })
        ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if second supply does not exist in multiple supplies', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValue(mockService);
        suppliesRepository.findById
            .mockResolvedValueOnce(mockSupply) // first supply exists
            .mockResolvedValueOnce(null); // second supply doesn't exist

        await expect(
            useCase.execute({ id: 1, services: [10], supplies: [20, 21] })
        ).rejects.toThrow(NotFoundError);
    });

    it('should update services and supplies successfully', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValue(mockService);
        suppliesRepository.findById.mockResolvedValue(mockSupply);
        serviceOrderRepository.update.mockResolvedValue({
            ...mockServiceOrder,
            services: [mockService],
            supplies: [mockSupply],
        });

        const result = await useCase.execute({ id: 1, services: [10], supplies: [20] });

        expect(serviceOrderRepository.findById).toHaveBeenCalledWith(1);
        expect(servicesRepository.findById).toHaveBeenCalledWith(10);
        expect(suppliesRepository.findById).toHaveBeenCalledWith(20);
        expect(mockServiceOrder.updateServices).toHaveBeenCalledWith([mockService]);
        expect(mockServiceOrder.updateSupplies).toHaveBeenCalledWith([mockSupply]);
        expect(serviceOrderRepository.update).toHaveBeenCalledWith(1, mockServiceOrder);
        expect(result).toEqual({
            clientId: 2,
            vehicleId: 3,
            services: [10],
            supplies: [20],
            createdAt: mockServiceOrder.createdAt,
            finalizedAt: mockServiceOrder.finalizedAt,
            status: mockServiceOrder.status,
        });
    });

    it('should update only services if supplies are not provided', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValue(mockService);
        suppliesRepository.findById.mockResolvedValue(mockSupply);
        serviceOrderRepository.update.mockResolvedValue({
            ...mockServiceOrder,
            services: [mockService],
            supplies: [mockSupply],
        });

        const result = await useCase.execute({ id: 1, services: [10] });

        expect(mockServiceOrder.updateServices).toHaveBeenCalledWith([mockService]);
        expect(mockServiceOrder.updateSupplies).toHaveBeenCalledWith([mockSupply]);
        expect(result.services).toEqual([10]);
        expect(result.supplies).toEqual([20]);
    });

    it('should update only supplies if services are not provided', async () => {
        serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
        servicesRepository.findById.mockResolvedValue(mockService);
        suppliesRepository.findById.mockResolvedValue(mockSupply);
        serviceOrderRepository.update.mockResolvedValue({
            ...mockServiceOrder,
            services: [mockService],
            supplies: [mockSupply],
        });

        const result = await useCase.execute({ id: 1, supplies: [20] });

        expect(mockServiceOrder.updateSupplies).toHaveBeenCalledWith([mockSupply]);
        expect(mockServiceOrder.updateServices).toHaveBeenCalledWith([mockService]);
        expect(result.services).toEqual([10]);
        expect(result.supplies).toEqual([20]);
    });

    it('should validate multiple services and supplies', async () => {
        const services = [{ id: 10 }, { id: 11 }];
        const supplies = [{ id: 20 }, { id: 21 }];
        const serviceOrder = { ...mockServiceOrder, services, supplies };
        serviceOrderRepository.findById.mockResolvedValue(serviceOrder);
        servicesRepository.findById.mockImplementation(id => ({ id }));
        suppliesRepository.findById.mockImplementation(id => ({ id }));
        serviceOrderRepository.update.mockResolvedValue({
            ...serviceOrder,
            services,
            supplies,
        });

        const result = await useCase.execute({ id: 1, services: [10, 11], supplies: [20, 21] });

        expect(result.services).toEqual([10, 11]);
        expect(result.supplies).toEqual([20, 21]);
    });
});