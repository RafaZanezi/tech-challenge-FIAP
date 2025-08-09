import { UseCase } from "../../../../shared/application/interfaces/use-case.interface";
import { ServiceOrderRepository } from "../../domain/service-order-repository.interface";
import { ServiceOrder } from "../../domain/service-order.entity";
import { UpdateServiceOrderStatusRequest, UpdateServiceOrderStatusResponse } from "../dtos/update-status-os";

export class UpdateOSUseCase implements UseCase<UpdateServiceOrderStatusRequest, UpdateServiceOrderStatusResponse> {

    constructor(private readonly serviceOrderRepository: ServiceOrderRepository) { }

    async execute(request: UpdateServiceOrderStatusRequest): Promise<UpdateServiceOrderStatusResponse> {
        const existingServiceOrder = await this.serviceOrderRepository.findById(request.id);

        if (!existingServiceOrder) {
            throw new Error(`Ordem de serviço com ID ${request.id} não encontrada.`);
        }

        const serviceOrder = new ServiceOrder({
            clientId: existingServiceOrder.clientId,
            vehicleId: existingServiceOrder.vehicleId,
            services: existingServiceOrder.services,
            supplies: existingServiceOrder.supplies,
            createdAt: existingServiceOrder.createdAt,
            finalizedAt: request.finishedAt ?? existingServiceOrder.finalizedAt,
            status: request.status,
            totalServicePrice: existingServiceOrder.totalServicePrice, // Preserving the total service price
        });

        const savedServiceOrder = await this.serviceOrderRepository.update(existingServiceOrder.id, serviceOrder);

        return {
            id: savedServiceOrder.id,
            createdAt: savedServiceOrder.createdAt,
            finalizedAt: savedServiceOrder.finalizedAt,
            status: savedServiceOrder.status,
        };
    }

}