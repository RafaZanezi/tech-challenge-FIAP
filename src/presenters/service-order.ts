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
      const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt } = serviceOrder;
      
      // Calculate totalServicePrice for DTO
      const servicesTotal = services.reduce((total, service) => total + (service.price || 0), 0);
      const suppliesTotal = supplies.reduce((total, supply) => total + (supply.price || 0), 0);
      const totalServicePrice = servicesTotal + suppliesTotal;
      
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
          const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt } = serviceOrder;
          
          // Calculate totalServicePrice for DTO
          const servicesTotal = services.reduce((total, service) => total + (service.price || 0), 0);
          const suppliesTotal = supplies.reduce((total, supply) => total + (supply.price || 0), 0);
          const totalServicePrice = servicesTotal + suppliesTotal;
          
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

  presentUpdate(serviceOrder: ServiceOrder | ServiceOrderDTO): void {
    this.statusCode = 200; // Use 200 for updates
    
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
      const { id, clientId, vehicleId, services, supplies, status, createdAt, finalizedAt } = serviceOrder;
      
      // Calculate totalServicePrice for DTO
      const servicesTotal = services.reduce((total, service) => total + (service.price || 0), 0);
      const suppliesTotal = supplies.reduce((total, supply) => total + (supply.price || 0), 0);
      const totalServicePrice = servicesTotal + suppliesTotal;
      
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
}