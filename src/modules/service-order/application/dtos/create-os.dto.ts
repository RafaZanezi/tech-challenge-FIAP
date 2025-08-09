import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";

export interface CreateServiceOrderRequest {
    id: number;
    clientId: number;
    vehicleId: number;
    services: number[];
    supplies: number[];
}

export interface CreateServiceOrderResponse {
    clientId: number;
    vehicleId: number;
    services: number[];
    supplies: number[];
    createdAt: Date;
    finalizedAt: Date | null;
    status: ServiceOrderStatus;
}