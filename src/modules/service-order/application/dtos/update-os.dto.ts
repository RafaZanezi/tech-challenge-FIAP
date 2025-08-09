import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";

export interface UpdateServiceOrderRequest {
    id: number;
    services?: number[];
    supplies?: number[];
}

export interface UpdateServiceOrderResponse {
    clientId: number;
    vehicleId: number;
    services: number[];
    supplies: number[];
    createdAt: Date;
    finalizedAt: Date | null;
    status: ServiceOrderStatus;
}