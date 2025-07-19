import { Supply } from '../../../../shared/domain/entities/remover/Supply';

export default class SupplyController {
    public static async create(item: Supply): Promise<Supply> {
        return Promise.resolve(item);
    }

    public static read(id: string): Promise<Supply> {
        throw new Error('Method not implemented.');
    }

    public static update(item: Supply): Promise<Supply> {
        return Promise.resolve(item);
    }

    public static delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
 }
