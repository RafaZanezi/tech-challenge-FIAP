import { ServiceOrderDTO } from "../dtos/service-order";
import { ServiceOrder } from "../entities/service-order";
import { ServiceOrderStatus } from "../interfaces/enums/service-order-status.enum";
import { BasePresenter } from "./base-presenter";

export class ServiceOrderPresenter extends BasePresenter {
  present(serviceOrder: ServiceOrder | ServiceOrderDTO): void {
    this.statusCode = 201;

    if (serviceOrder instanceof ServiceOrder) {
      const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt, totalServicePrice } = serviceOrder;
      
      this.response = {
        success: true,
        data: {
          id,
          clientId,
          vehicleId,
          services: services.map(service => service.toJSON()),
          supplies: supplies.map(supply => supply.toJSON()),
          status,
          createdAt,
          finalizedAt,
          totalServicePrice,
        }
      };
    } else {
      const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt, totalServicePrice } = serviceOrder;
      
      this.response = {
        success: true,
        data: {
          id,
          clientId,
          vehicleId,
          services,
          supplies,
          status,
          createdAt,
          finalizedAt,
          totalServicePrice,
        }
      };
    }
  }

  presentList(serviceOrders: (ServiceOrder | ServiceOrderDTO)[]): void {
    this.statusCode = 200;

    this.response = {
      success: true,
      data: serviceOrders.map(serviceOrder => {
        if (serviceOrder instanceof ServiceOrder) {
          const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt, totalServicePrice } = serviceOrder;
          
          return {
            id,
            clientId,
            vehicleId,
            services: services.map(service => service.toJSON()),
            supplies: supplies.map(supply => supply.toJSON()),
            status,
            createdAt,
            finalizedAt,
            totalServicePrice,
          };
        } else {
          const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt, totalServicePrice } = serviceOrder;
          
          return {
            id,
            clientId,
            vehicleId,
            services,
            supplies,
            status,
            createdAt,
            finalizedAt,
            totalServicePrice,
          };
        }
      })
    };
  }
}