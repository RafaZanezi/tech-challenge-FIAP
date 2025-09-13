import { ServiceOrderDTO } from "../dtos/service-order";
import { Service } from "../entities/service";
import { ServiceOrder } from "../entities/service-order";
import { Supply } from "../entities/supply";
import { ServiceOrderStatus } from "../interfaces/enums/service-order-status.enum";

export class ServiceOrderAdapter {
    static adapt(serviceOrderDTO: ServiceOrderDTO): ServiceOrder {
        const { id,
            clientId,
            vehicleId,
            services,
            supplies,
            status,
            createdAt,
            finalizedAt,
            totalServicePrice
        } = serviceOrderDTO;

        return new ServiceOrder({
            clientId,
            vehicleId,
            services: services.map(serviceDTO => new Service(serviceDTO)),
            supplies: supplies.map(supplyDTO => new Supply(supplyDTO)),
            status: status as ServiceOrderStatus,
            createdAt,
            finalizedAt,
            totalServicePrice,
        }, id);
    }
}