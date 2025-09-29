import { ServiceOrderDTO } from "../dtos/service-order";
import { Service } from "../entities/service";
import { ServiceOrder } from "../entities/service-order";
import { Supply } from "../entities/supply";
import { ServiceOrderStatus } from "../interfaces/enums/service-order-status.enum";

export class ServiceOrderAdapter {
  static adapt(serviceOrderDTO: ServiceOrderDTO): ServiceOrder {
    return new ServiceOrder({
      clientId: serviceOrderDTO.clientId,
      vehicleId: serviceOrderDTO.vehicleId,
      services: serviceOrderDTO.services.map(serviceDTO => new Service({
        name: serviceDTO.name,
        description: serviceDTO.description,
        price: serviceDTO.price
      }, serviceDTO.id)),
      supplies: serviceOrderDTO.supplies.map(supplyDTO => new Supply({
        name: supplyDTO.name,
        quantity: supplyDTO.quantity,
        price: supplyDTO.price
      }, supplyDTO.id)),
      createdAt: serviceOrderDTO.createdAt,
      finalizedAt: serviceOrderDTO.finalizedAt,
      status: serviceOrderDTO.status as ServiceOrderStatus,
      totalServicePrice: serviceOrderDTO.totalServicePrice
    }, serviceOrderDTO.id);
  }
}
