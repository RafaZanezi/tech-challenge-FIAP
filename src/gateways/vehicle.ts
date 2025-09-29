import { VehicleDTO } from "../dtos/vehicle";
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

    async findAll(): Promise<VehicleDTO[]> {
        const results = await this.queries.findAll<any[]>(this.tableName, null);
        return results.map(result => ({
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        }));
    }

    async findById(id: number): Promise<VehicleDTO | null> {
        const result = await this.queries.findByParams<any>(this.tableName, null, { id });
        if (!result) return null;
        
        return {
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        };
    }

    async findByLicensePlate(licensePlate: string): Promise<VehicleDTO | null> {
        const result = await this.queries.findByParams<any>(this.tableName, null, { license_plate: licensePlate });
        if (!result) return null;
        
        return {
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        };
    }

    async findByClientId(clientId: number): Promise<VehicleDTO[]> {
        const results = await this.queries.findAllByParams<any>(this.tableName, null, { client_id: clientId });
        return results.map(result => ({
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        }));
    }

    async insert(entity: Vehicle): Promise<VehicleDTO> {
        // Mapear camelCase para snake_case para o banco de dados
        const dbData = {
            brand: entity.brand,
            model: entity.model,
            year: entity.year,
            license_plate: entity.licensePlate,
            client_id: entity.clientId
        };
        
        const result = await this.queries.insert(this.tableName, { props: dbData } as any);
        
        // Mapear snake_case de volta para camelCase
        return {
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        };
    }

    async update(id: number, entity: Partial<Vehicle>): Promise<VehicleDTO> {
        // Mapear camelCase para snake_case para o banco de dados
        const dbData: Record<string, any> = {};
        
        if (entity.brand !== undefined) dbData.brand = entity.brand;
        if (entity.model !== undefined) dbData.model = entity.model;
        if (entity.year !== undefined) dbData.year = entity.year;
        if (entity.licensePlate !== undefined) dbData.license_plate = entity.licensePlate;
        if (entity.clientId !== undefined) dbData.client_id = entity.clientId;
        
        const result = await this.queries.update<any>(this.tableName, id, dbData);
        
        // Mapear snake_case de volta para camelCase
        return {
            id: result.id,
            brand: result.brand,
            model: result.model,
            year: result.year,
            licensePlate: result.license_plate,
            clientId: result.client_id
        };
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}