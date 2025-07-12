import { Client } from "../../models/domain/Client";

export default class ClientController {
    static async create(item: Client): Promise<Client> {
        return Promise.resolve(item);
    }

    static read(id: string): Promise<Client> {
        throw new Error("Method not implemented.");
    }

    static update(item: Client): Promise<Client> {
        return Promise.resolve(item);
    }

    static delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}