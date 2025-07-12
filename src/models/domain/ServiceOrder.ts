import { Status } from "../../enums/status.enum";
import { Client } from "./Client";
import { Service } from "./Service";
import { Supply } from "./Supply";
import { Vehicle } from "./Vehicle";

export class ServiceOrder {
    client: Client;
    vehicle: Vehicle;
    services: Service[];
    supplies: Supply[];
    createdAt: Date;
    finalizedAt: Date;
    status: Status;

    constructor(client: Client, vehicle: Vehicle, services: Service[]) {
        this.client = client;
        this.vehicle = vehicle;
        this.services = services;

        this.createdAt = new Date();
        this.status = Status.RECEIVED; // Default status
    }

    startDiagnosis() {
        this.status = Status.IN_DIAGNOSIS;
    }

    updateServices(services: Service[]) {
        this.services = services;
    }

    updateSupplies(supplies: Supply[]) {
        this.supplies = supplies;
    }

    submitForApproval() {
        this.status = Status.WAITING_FOR_APPROVAL;
    }

    approveOrder() {
        this.status = Status.APPROVED;
    }

    startExecution() {
        this.status = Status.IN_PROGRESS;
    }

    finalizeOrder() {
        this.finalizedAt = new Date();
        this.status = Status.FINISHED;
    }

    deliverOrder() {
        this.status = Status.DELIVERED;
    }

    cancelOrder() {
        this.status = Status.CANCELLED;
    }
}