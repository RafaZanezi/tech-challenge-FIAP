import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";

export interface FindOSRequest {
    id?: number;
}

export interface FindOSResponse {
    id: number;
    clientId: number;
    vehicleId: number;
    services: FindOsServiceResponse[];
    supplies: FindOsSupplyResponse[];
    createdAt: Date;
    finalizedAt: Date;
    status: ServiceOrderStatus;
}

interface FindOsServiceResponse {
    name: string;
    description: string;
    price: number;
}

interface FindOsSupplyResponse {
    name: string;
    quantity: number;
    price: number;
}