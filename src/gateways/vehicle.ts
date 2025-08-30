import { Vehicle } from "../entities/vehicle";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { VehicleGatewayInterface } from "../interfaces/gateways";

export class VehicleGateway implements VehicleGatewayInterface {
    private queries: PostgresConnection;

    private readonly tableName: string = "vehicles";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    findAll(): Promise<Vehicle[]> {
        return this.queries.findAll<Vehicle[]>(this.tableName, null);
    }

    findById(id: number): Promise<Vehicle | null> {
        return this.queries.findByParams<Vehicle>(this.tableName, null, { id });
    }

    findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
        return this.queries.findByParams<Vehicle>(this.tableName, null, { license_plate: licensePlate });
    }

    findByClientId(clientId: number): Promise<Vehicle[]> {
        return this.queries.findAllByParams<Vehicle>(this.tableName, null, { client_id: clientId });
    }

    insert(entity: Vehicle): Promise<Vehicle> {
        // Mapear camelCase para snake_case para o banco de dados
        const dbData = {
            brand: entity.brand,
            model: entity.model,
            year: entity.year,
            license_plate: entity.licensePlate,
            client_id: entity.clientId
        };
        
        return this.queries.insert(this.tableName, { props: dbData } as any);
    }

    update(id: number, entity: Partial<Vehicle>): Promise<Vehicle> {
        // Mapear camelCase para snake_case para o banco de dados
        const dbData: Record<string, any> = {};
        
        if (entity.brand !== undefined) dbData.brand = entity.brand;
        if (entity.model !== undefined) dbData.model = entity.model;
        if (entity.year !== undefined) dbData.year = entity.year;
        if (entity.licensePlate !== undefined) dbData.license_plate = entity.licensePlate;
        if (entity.clientId !== undefined) dbData.client_id = entity.clientId;
        
        return this.queries.update<Vehicle>(this.tableName, id, dbData);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}