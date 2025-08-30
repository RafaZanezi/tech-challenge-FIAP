import { Supply } from "../entities/supply";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { SupplyGatewayInterface } from "../interfaces/gateways";

export class SupplyGateway implements SupplyGatewayInterface {
    private queries: PostgresConnection;

    private readonly tableName: string = "supplies";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    findAll(): Promise<Supply[]> {
        return this.queries.findAll<Supply[]>(this.tableName, null);
    }

    findById(id: number): Promise<Supply | null> {
        return this.queries.findByParams<Supply>(this.tableName, null, { id });
    }

    findByName(name: string): Promise<Supply | null> {
        return this.queries.findByParams<Supply>(this.tableName, null, { name });
    }

    insert(entity: Supply): Promise<Supply> {
        return this.queries.insert<Supply>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Supply>): Promise<Supply> {
        return this.queries.update<Supply>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}