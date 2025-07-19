import { ServiceOrderStatus } from '../enums/service-order-status.enum';
import { Service } from './remover/Service';
import { Supply } from './remover/Supply';

export class ServiceOrder {
    public clientId: number;
    public vehicleId: number;
    public services: Service[];
    public supplies: Supply[];
    public createdAt: Date;
    public finalizedAt: Date;
    public status: ServiceOrderStatus;

    constructor(clientId: number, vehicleId: number, services: Service[]) {
        this.clientId = clientId;
        this.vehicleId = vehicleId;
        this.services = services;

        this.createdAt = new Date();
        this.status = ServiceOrderStatus.RECEIVED; // Default status
    }

    public startDiagnosis() {
        this.status = ServiceOrderStatus.IN_DIAGNOSIS;
    }

    public updateServices(services: Service[]) {
        this.services = services;
    }

    public updateSupplies(supplies: Supply[]) {
        this.supplies = supplies;
    }

    public submitForApproval() {
        this.status = ServiceOrderStatus.WAITING_FOR_APPROVAL;
    }

    public approveOrder() {
        this.status = ServiceOrderStatus.APPROVED;
    }

    public startExecution() {
        this.status = ServiceOrderStatus.IN_PROGRESS;
    }

    public finalizeOrder() {
        this.finalizedAt = new Date();
        this.status = ServiceOrderStatus.FINISHED;
    }

    public deliverOrder() {
        this.status = ServiceOrderStatus.DELIVERED;
    }

    public cancelOrder() {
        this.status = ServiceOrderStatus.CANCELLED;
    }
}
