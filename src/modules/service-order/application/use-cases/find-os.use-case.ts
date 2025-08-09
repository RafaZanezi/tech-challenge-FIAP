import { UseCase } from "../../../../shared/application/interfaces/use-case.interface";
import { ServiceOrderRepository } from "../../domain/service-order-repository.interface";
import { FindOSRequest, FindOSResponse } from "../dtos/find-os.dto";

export class FindOSUseCase implements UseCase<FindOSRequest, FindOSResponse> {

    constructor(private readonly serviceOrderRepository: ServiceOrderRepository) { }

    async execute(request: FindOSRequest): Promise<FindOSResponse> {
        const serviceOrder = await this.serviceOrderRepository.findById(request.id);

        return {
            id: serviceOrder.id,
            clientId: serviceOrder.clientId,
            vehicleId: serviceOrder.vehicleId,
            services: serviceOrder.services.map(service => ({
                name: service.name,
                description: service.description,
                price: service.price
            })),
            supplies: serviceOrder.supplies.map(supply => ({
                name: supply.name,
                quantity: supply.quantity,
                price: supply.price
            })),
            createdAt: serviceOrder.createdAt,
            finalizedAt: serviceOrder.finalizedAt,
            status: serviceOrder.status
        };

    }

}