import { ServiceDTO } from "../dtos/service";
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

    findAll(): Promise<ServiceDTO[]> {
        return this.queries.findAll<ServiceDTO[]>(this.tableName, null);
    }

    findById(id: number): Promise<ServiceDTO | null> {
        return this.queries.findByParams<ServiceDTO>(this.tableName, null, { id });
    }

    findByName(name: string): Promise<ServiceDTO | null> {
        return this.queries.findByParams<ServiceDTO>(this.tableName, null, { name });
    }

    insert(entity: Service): Promise<ServiceDTO> {
        return this.queries.insert<ServiceDTO>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Service>): Promise<ServiceDTO> {
        return this.queries.update<ServiceDTO>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}