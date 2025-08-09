import { ServiceOrder } from "./service-order.entity";

export interface ServiceOrderRepository {
    create(data: any): Promise<ServiceOrder>;
    update(id: number, data: any): Promise<ServiceOrder>;
    findAll(): Promise<ServiceOrder[]>;
    findById(id: number): Promise<ServiceOrder | null>;
    findOpenOSByCarAndClient(carId: number, client: string): Promise<ServiceOrder[]>;
}