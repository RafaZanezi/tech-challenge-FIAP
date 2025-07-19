import { Supply } from "../../../../shared/domain/entities/remover/Supply";

export default class SupplyController {
    static async create(item: Supply): Promise<Supply> {
        return Promise.resolve(item);
    }

    static read(id: string): Promise<Supply> {
        throw new Error("Method not implemented.");
    }

    static update(item: Supply): Promise<Supply> {
        return Promise.resolve(item);
    }

    static delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
 }