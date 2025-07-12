import { Vehicle } from "../../models/domain/Vehicle";

export default class VehicleController {
    static async create(item: Vehicle): Promise<Vehicle> {
        return Promise.resolve(item);
    }

    static read(id: string): Promise<Vehicle> {
        throw new Error("Method not implemented.");
    }

    static update(item: Vehicle): Promise<Vehicle> {
        return Promise.resolve(item);
    }

    static delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
