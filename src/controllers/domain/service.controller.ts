import { Service } from "../../models/domain/Service";

export default class ServiceController {
    static async create(item: Service): Promise<Service> {
        return Promise.resolve(item);
    }

    static read(id: string): Promise<Service> {
        throw new Error("Method not implemented.");
    }

    static update(item: Service): Promise<Service> {
        return Promise.resolve(item);
    }

    static delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}