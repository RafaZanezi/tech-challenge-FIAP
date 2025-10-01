import { ServiceOrderDTO } from "../dtos/service-order";
import { ServiceOrder } from "../entities/service-order";
import { PostgresConnection } from "../external/postgres/database-queries";
import { DatabaseConnection } from "../interfaces/connection";
import { ServiceOrderGatewayInterface } from "../interfaces/gateways";

export class ServiceOrderGateway implements ServiceOrderGatewayInterface {
    private queries: PostgresConnection;

    private readonly tableName: string = "service_orders";

    constructor(database: DatabaseConnection) {
        this.queries = new PostgresConnection(database);
    }

    private mapEntityToDb(entity: ServiceOrder): any {
        return {
            clientId: entity.clientId,
            vehicleId: entity.vehicleId,
            services: JSON.stringify(entity.services.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                price: s.price
            }))),
            supplies: JSON.stringify(entity.supplies.map(s => ({
                id: s.id,
                name: s.name,
                quantity: s.quantity,
                price: s.price
            }))),
            status: entity.status,
            createdAt: entity.createdAt,
            finalizedAt: entity.finalizedAt
        };
    }

    private mapDbToDto(dbResult: any): ServiceOrderDTO {
        return {
            id: dbResult.id,
            clientId: dbResult.client_id,
            vehicleId: dbResult.vehicle_id,
            services: typeof dbResult.services === 'string' ? JSON.parse(dbResult.services) : dbResult.services,
            supplies: typeof dbResult.supplies === 'string' ? JSON.parse(dbResult.supplies) : dbResult.supplies,
            status: dbResult.status,
            createdAt: dbResult.created_at,
            finalizedAt: dbResult.finalized_at
        };
    }

    async findAll(): Promise<ServiceOrderDTO[]> {
        const results = await this.queries.findAll<any[]>(this.tableName, null);
        return results.map(result => this.mapDbToDto(result));
    }

    async findAllActiveWithOrdering(): Promise<ServiceOrderDTO[]> {
        // Exclude FINISHED and DELIVERED orders (logical exclusion)
        // Order by status priority: IN_PROGRESS > WAITING_FOR_APPROVAL > IN_DIAGNOSIS > RECEIVED
        // Then by createdAt (oldest first)
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE status NOT IN ('FINISHED', 'DELIVERED')
            ORDER BY 
                CASE status
                    WHEN 'IN_PROGRESS' THEN 1
                    WHEN 'WAITING_FOR_APPROVAL' THEN 2
                    WHEN 'IN_DIAGNOSIS' THEN 3
                    WHEN 'RECEIVED' THEN 4
                    ELSE 5
                END,
                created_at ASC
        `;
        
        const results = await this.queries.customQuery<any[]>(query);
        return results.map(result => this.mapDbToDto(result));
    }

    async findById(id: number): Promise<ServiceOrderDTO | null> {
        const result = await this.queries.findByParams<any>(this.tableName, null, { id });
        return result ? this.mapDbToDto(result) : null;
    }

    async findOpenOSByCarAndClient(carId: number, clientId: number): Promise<ServiceOrderDTO | null> {
        const result = await this.queries.findByParams<any>(this.tableName, null, { 
            vehicleId: carId, 
            clientId: clientId,
            status: ['RECEIVED', 'IN_DIAGNOSIS', 'WAITING_FOR_APPROVAL', 'APPROVED', 'IN_PROGRESS']
        });
        return result ? this.mapDbToDto(result) : null;
    }

    async create(entity: ServiceOrder): Promise<ServiceOrderDTO> {
        const dbData = this.mapEntityToDb(entity);
        const result = await this.queries.insert<any>(this.tableName, dbData);
        return this.mapDbToDto(result);
    }

    async update(id: number, entity: Partial<ServiceOrder>): Promise<ServiceOrderDTO> {
        const dbData = this.mapEntityToDb(entity as ServiceOrder);
        const result = await this.queries.update<any>(this.tableName, id, dbData);
        return this.mapDbToDto(result);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}