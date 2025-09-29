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

    findAll(): Promise<ServiceOrderDTO[]> {
        return this.queries.findAll<ServiceOrderDTO[]>(this.tableName, null);
    }

    findById(id: number): Promise<ServiceOrderDTO | null> {
        return this.queries.findByParams<ServiceOrderDTO>(this.tableName, null, { id });
    }

    findOpenOSByCarAndClient(carId: number, clientId: number): Promise<ServiceOrderDTO | null> {
        return this.queries.findByParams<ServiceOrderDTO>(this.tableName, null, { 
            vehicle_id: carId, 
            client_id: clientId,
            status: ['RECEIVED', 'IN_DIAGNOSIS', 'WAITING_FOR_APPROVAL', 'APPROVED', 'IN_PROGRESS']
        });
    }

    create(entity: ServiceOrder): Promise<ServiceOrderDTO> {
        return this.queries.insert<ServiceOrderDTO>(this.tableName, entity);
    }

    update(id: number, entity: Partial<ServiceOrder>): Promise<ServiceOrderDTO> {
        return this.queries.update<ServiceOrderDTO>(this.tableName, id, entity);
    }

    delete(id: number): Promise<void> {
        return this.queries.delete(this.tableName, id);
    }
}