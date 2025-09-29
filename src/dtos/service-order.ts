import { ServiceDTO } from "./service";
import { SupplyDTO } from "./supply";

export interface ServiceOrderDTO {
    id: number;
    clientId: number;
    vehicleId: number;
    services: ServiceDTO[];
    supplies: SupplyDTO[];
    createdAt: Date;
    finalizedAt: Date | null;
    status: string;
    totalServicePrice: number;
}