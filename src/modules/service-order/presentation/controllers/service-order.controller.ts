import { ServiceOrder } from '../../../../shared/domain/entities/remover/ServiceOrder';

export default class ServiceOrderController {

    public static async create(item: ServiceOrder): Promise<ServiceOrder> {
        return Promise.resolve(item);
    }

    public static read(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static startDiagnosis(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static update(item: ServiceOrder): Promise<ServiceOrder> {
        return Promise.resolve(item);
    }

    public static submitForApproval(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static approve(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static startExecution(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static finalize(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static deliver(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }

    public static cancel(id: string): Promise<ServiceOrder> {
        throw new Error('Method not implemented.');
    }
}
