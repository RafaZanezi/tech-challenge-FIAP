import { ClientDTO } from "../dtos/client";
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

    findAll(): Promise<ClientDTO[]> {
        return this.queries.findAll<ClientDTO[]>(this.tableName, null);
    }

    findById(id: number): Promise<ClientDTO | null> {
        return this.queries.findByParams<ClientDTO>(this.tableName, null, { id });
    }

    findByIdentifier(identifier: string): Promise<ClientDTO | null> {
        return this.queries.findByParams<ClientDTO>(this.tableName, null, { identifier });
    }

    insert(entity: Client): Promise<ClientDTO> {
        return this.queries.insert<ClientDTO>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Client>): Promise<ClientDTO> {
        return this.queries.update<ClientDTO>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}