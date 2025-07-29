import { Service } from '../../../../shared/domain/entities/remover/Service';

export default class ServiceController {
    public static async create(item: Service): Promise<Service> {
        return Promise.resolve(item);
    }

    public static read(id: string): Promise<Service> {
        throw new Error('Método não implementado.');
    }

    public static update(item: Service): Promise<Service> {
        return Promise.resolve(item);
    }

    public static delete(id: string): Promise<void> {
        throw new Error('Método não implementado.');
    }
}
