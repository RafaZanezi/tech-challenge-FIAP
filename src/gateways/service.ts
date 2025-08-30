import { Service } from "../entities/service";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { ServiceGatewayInterface } from "../interfaces/gateways";

export class ServiceGateway implements ServiceGatewayInterface {
    private queries: PostgresConnection;

    private readonly tableName: string = "services";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    findAll(): Promise<Service[]> {
        return this.queries.findAll<Service[]>(this.tableName, null);
    }

    findById(id: number): Promise<Service | null> {
        return this.queries.findByParams<Service>(this.tableName, null, { id });
    }

    findByName(name: string): Promise<Service | null> {
        return this.queries.findByParams<Service>(this.tableName, null, { name });
    }

    insert(entity: Service): Promise<Service> {
        return this.queries.insert<Service>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Service>): Promise<Service> {
        return this.queries.update<Service>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}