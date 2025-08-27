import { Client } from "../entities/client";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { ClientGatewayInterface } from "../interfaces/gateways";

export class ClientGateway implements ClientGatewayInterface {
    private queries: PostgresConnection;

    private readonly tableName: string = "clients";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    findAll(): Promise<Client[]> {
        return this.queries.findAll<Client[]>(this.tableName, null);
    }

    findById(id: number): Promise<Client | null> {
        return this.queries.findByParams<Client>(this.tableName, null, { id });
    }

    findByIdentifier(identifier: string): Promise<Client | null> {
        return this.queries.findByParams<Client>(this.tableName, null, { identifier });
    }

    insert(entity: Client): Promise<Client> {
        return this.queries.insert<Client>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Client>): Promise<Client> {
        return this.queries.update<Client>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}