import { ServiceOrderStatus } from "../enums/service-order-status.enum";
import { Service } from "./remover/Service";
import { Supply } from "./remover/Supply";

export class ServiceOrder {
    clientId: number;
    vehicleId: number;
    services: Service[];
    supplies: Supply[];
    createdAt: Date;
    finalizedAt: Date;
    status: ServiceOrderStatus;

    constructor(clientId: number, vehicleId: number, services: Service[]) {
        this.clientId = clientId;
        this.vehicleId = vehicleId;
        this.services = services;

        this.createdAt = new Date();
        this.status = ServiceOrderStatus.RECEIVED; // Default status
    }

    startDiagnosis() {
        this.status = ServiceOrderStatus.IN_DIAGNOSIS;
    }

    updateServices(services: Service[]) {
        this.services = services;
    }

    updateSupplies(supplies: Supply[]) {
        this.supplies = supplies;
    }

    submitForApproval() {
        this.status = ServiceOrderStatus.WAITING_FOR_APPROVAL;
    }

    approveOrder() {
        this.status = ServiceOrderStatus.APPROVED;
    }

    startExecution() {
        this.status = ServiceOrderStatus.IN_PROGRESS;
    }

    finalizeOrder() {
        this.finalizedAt = new Date();
        this.status = ServiceOrderStatus.FINISHED;
    }

    deliverOrder() {
        this.status = ServiceOrderStatus.DELIVERED;
    }

    cancelOrder() {
        this.status = ServiceOrderStatus.CANCELLED;
    }
}