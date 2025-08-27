import { UseCase } from "../../../../shared/application/interfaces/use-case.interface";
import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";
import { ConflictError } from "../../../../shared/domain/errors/domain-errors";
import { ClientRepository } from "../../../client/domain/client-repository.interface";
import { Service } from "../../../service/domain/service.entity";
import { Supply } from "../../../supply/domain/supply.entity";
import { ServiceOrderRepository } from "../../domain/service-order-repository.interface";
import { ServiceOrder } from "../../domain/service-order.entity";
import { CreateServiceOrderRequest } from "../dtos/create-os.dto";

export class CreateOSUseCase implements UseCase<CreateServiceOrderRequest, any> {

    constructor(
        private readonly serviceOrderRepository: ServiceOrderRepository,
        private readonly clientRepository: ClientRepository,
    ) { }

    async execute(request: CreateServiceOrderRequest): Promise<any> {

        const existingOS = await this.serviceOrderRepository.findOpenOSByCarAndClient(request.vehicleId, request.client);

        if (existingOS) {
            throw new ConflictError('Já existe uma ordem de serviço aberta para este veículo e cliente');
        }

        const client = await this.clientRepository.findByIdentifier(request.client);

        if (!client) {
            throw new ConflictError('Cliente não encontrado');
        }
        
        const serviceOrder = new ServiceOrder({
            clientId: client.id,
            vehicleId: request.vehicleId,
            services: request.services.map(item => ({ id: item })) as Partial<Service[]>,
            supplies: request.supplies.map(item => ({ id: item })) as Partial<Supply[]>,
            createdAt: new Date(),
            finalizedAt: null,
            status: ServiceOrderStatus.RECEIVED,
            totalServicePrice: 0, // Inicialmente, o preço total é zero
        });

        const savedServiceOrder = await this.serviceOrderRepository.create(serviceOrder);

        return {
            id: savedServiceOrder.id,
            clientId: savedServiceOrder.clientId,
            vehicleId: savedServiceOrder.vehicleId,
            services: savedServiceOrder.services,
            supplies: savedServiceOrder.supplies,
            createdAt: savedServiceOrder.createdAt,
            finalizedAt: savedServiceOrder.finalizedAt,
            status: savedServiceOrder.status,
        };
    }

}