import { UserDTO } from "../dtos/auth";
import { User } from "../entities/auth-user";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { UserGatewayInterface } from "../interfaces/gateways";

export class UserGateway implements UserGatewayInterface {
    private queries: PostgresConnection;
    private readonly tableName: string = "users";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    findByName(name: string): Promise<UserDTO | null> {
        return this.queries.findByParams<UserDTO>(this.tableName, null, { name });
    }

    findById(id: number): Promise<UserDTO | null> {
        return this.queries.findByParams<UserDTO>(this.tableName, null, { id });
    }

    insert(entity: User): Promise<UserDTO> {
        return this.queries.insert<UserDTO>(this.tableName, entity);
    }

    findAll(): Promise<UserDTO[]> {
        return this.queries.findAll<UserDTO[]>(this.tableName, null);
    }

    update(id: number, entity: Partial<User>): Promise<UserDTO> {
        return this.queries.update<UserDTO>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}