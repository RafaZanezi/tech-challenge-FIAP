import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";

export interface UpdateServiceOrderStatusRequest {
    id: number;
    status: ServiceOrderStatus;
    finishedAt?: Date; // Optional, only needed for finalization
}

export interface UpdateServiceOrderStatusResponse {
    id: number;
    createdAt: Date;
    finalizedAt: Date | null;
    status: ServiceOrderStatus;
}