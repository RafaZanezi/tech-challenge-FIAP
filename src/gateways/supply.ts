import { SupplyDTO } from "../dtos/supply";
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

    findAll(): Promise<SupplyDTO[]> {
        return this.queries.findAll<SupplyDTO[]>(this.tableName, null);
    }

    findById(id: number): Promise<SupplyDTO | null> {
        return this.queries.findByParams<SupplyDTO>(this.tableName, null, { id });
    }

    findByName(name: string): Promise<SupplyDTO | null> {
        return this.queries.findByParams<SupplyDTO>(this.tableName, null, { name });
    }

    insert(entity: Supply): Promise<SupplyDTO> {
        return this.queries.insert<SupplyDTO>(this.tableName, entity);
    }

    update(id: number, entity: Partial<Supply>): Promise<SupplyDTO> {
        return this.queries.update<SupplyDTO>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}