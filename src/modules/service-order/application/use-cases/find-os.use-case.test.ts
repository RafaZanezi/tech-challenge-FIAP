import { FindOSUseCase } from './find-os.use-case';
import { ServiceOrderRepository } from '../../domain/service-order-repository.interface';
import { FindOSRequest } from '../dtos/find-os.dto';
import { ServiceOrder } from '../../domain/service-order.entity';
import { Service } from '../../../service/domain/service.entity';
import { Supply } from '../../../supply/domain/supply.entity';
import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';

describe('FindOSUseCase', () => {
	let serviceOrderRepository: jest.Mocked<ServiceOrderRepository>;
	let useCase: FindOSUseCase;

	const mockServiceOrder = new ServiceOrder({
		clientId: 1,
		vehicleId: 2,
		services: [
			new Service({ name: 'Troca de óleo', description: 'Óleo sintético', price: 100 }),
			new Service({ name: 'Alinhamento', description: 'Alinhamento completo', price: 80 })
		],
		supplies: [
			new Supply({ name: 'Filtro de óleo', quantity: 1, price: 30 })
		],
		createdAt: new Date('2024-06-01T10:00:00Z'),
		finalizedAt: new Date('2024-06-02T15:00:00Z'),
		status: ServiceOrderStatus.FINISHED,
		totalServicePrice: 210
	});

	beforeEach(() => {
		serviceOrderRepository = {
			findById: jest.fn()
		} as any;
		useCase = new FindOSUseCase(serviceOrderRepository);
	});

	it('should return service order details correctly', async () => {
		serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

		const request: FindOSRequest = { id: 1 };
		const response = await useCase.execute(request);

		expect(serviceOrderRepository.findById).toHaveBeenCalledWith(1);
		expect(response).toEqual({
			clientId: 1,
			vehicleId: 2,
			services: [
				{ name: 'Troca de óleo', description: 'Óleo sintético', price: 100 },
				{ name: 'Alinhamento', description: 'Alinhamento completo', price: 80 }
			],
			supplies: [
				{ name: 'Filtro de óleo', quantity: 1, price: 30 }
			],
			createdAt: new Date('2024-06-01T10:00:00Z'),
			finalizedAt: new Date('2024-06-02T15:00:00Z'),
			status: 'FINISHED',
			totalPrice: 210
		});
	});

	it('should propagate errors from repository', async () => {
		serviceOrderRepository.findById.mockRejectedValue(new Error('Not found'));

		await expect(useCase.execute({ id: 1 })).rejects.toThrow('Not found');
	});

	// Integration-like test (mocking repository but simulating real flow)
	it('should call repository and map all fields', async () => {
		serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

		const result = await useCase.execute({ id: mockServiceOrder.id });

		expect(result.id).toBe(mockServiceOrder.id);
		expect(result.clientId).toBe(mockServiceOrder.clientId);
		expect(result.vehicleId).toBe(mockServiceOrder.vehicleId);
		expect(result.status).toBe(mockServiceOrder.status);
		expect(result.totalPrice).toBe(mockServiceOrder.totalServicePrice);
		expect(result.services.length).toBe(2);
		expect(result.supplies.length).toBe(1);
	});
});