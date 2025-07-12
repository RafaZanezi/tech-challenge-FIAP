import { ServiceOrder } from "../../models/domain/ServiceOrder";

export default class ServiceOrderController {

    static async create(item: ServiceOrder): Promise<ServiceOrder> {
        return Promise.resolve(item);
    }

    static read(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static startDiagnosis(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static update(item: ServiceOrder): Promise<ServiceOrder> {
        return Promise.resolve(item);
    }

    static submitForApproval(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static approve(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static startExecution(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static finalize(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static deliver(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }

    static cancel(id: string): Promise<ServiceOrder> {
        throw new Error("Method not implemented.");
    }
}