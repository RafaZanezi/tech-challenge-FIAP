import { ServiceOrderRepository } from "../../domain/service-order-repository.interface";
import db from '../../../../shared/infrastructure/database/connection';
import { ServiceOrder } from "../../domain/service-order.entity";
import { ServiceOrderStatus } from "../../../../shared/domain/enums/service-order-status.enum";

export class PostgresServiceOrderRepository implements ServiceOrderRepository {
    async create(data: ServiceOrder): Promise<ServiceOrder> {
        try {
            const result = await db.query(
                'INSERT INTO service_orders (client_id, vehicle_id, services, supplies, status, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, client_id, vehicle_id, services, supplies, status, created_at',
                [data.clientId, data.vehicleId, JSON.stringify(data.services), JSON.stringify(data.supplies), data.status, data.createdAt]
            );

            const row = result.rows[0];
            return new ServiceOrder(
                {
                    clientId: row.client_id,
                    vehicleId: row.vehicle_id,
                    services: row.services,
                    supplies: row.supplies,
                    status: row.status,
                    createdAt: row.created_at,
                    finalizedAt: row.finalized_at
                },
                row.id
            );
        } catch (error) {
            console.error('Error saving service order:', error);
            throw new Error('Failed to save service order');
        }
    }

    async update(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
        try {
            const current = await this.findById(id);

            if (!current) {
                throw new Error('Ordem de serviço não encontrada');
            }

            const result = await db.query(
                'UPDATE service_orders SET services = $1, supplies = $2, status = $3, finalized_at = $4 WHERE id = $5 RETURNING id, client_id, vehicle_id, services, supplies, status, created_at',
                [JSON.stringify(data.services), JSON.stringify(data.supplies), data.status, data.finalizedAt, id]
            );

            const row = result.rows[0];

            return new ServiceOrder(
                {
                    clientId: row.client_id,
                    vehicleId: row.vehicle_id,
                    services: row.services,
                    supplies: row.supplies,
                    status: row.status,
                    createdAt: row.created_at,
                    finalizedAt: row.finalized_at
                },
                row.id
            );
        } catch (error) {
            console.error('Error updating service order:', error);
            throw new Error('Failed to update service order');
        }
    }

    async findAll(): Promise<ServiceOrder[]> {
        try {
            const result = await db.query(
                `
                SELECT
                    t.id,
                    t.client_id,
                    t.vehicle_id,
                    (
                        SELECT jsonb_agg(srv)
                        FROM (
                        SELECT
                            s.id,
                            s.name,
                            s.description,
                            s.price
                        FROM jsonb_array_elements(t.services::jsonb) AS js
                        JOIN services s ON s.id = (js->>'id')::int
                        ) AS srv
                    ) AS services,
                    (
                        SELECT jsonb_agg(sup)
                        FROM (
                        SELECT
                            sup.id,
                            sup.name,
                            sup.quantity,
                            sup.price
                        FROM jsonb_array_elements(t.supplies::jsonb) AS js
                        JOIN supplies sup ON sup.id = (js->>'id')::int
                        ) AS sup
                    ) AS supplies,
                    t.created_at,
                    t.status
                FROM service_orders t;
                `
            );

            return result.rows.map(row => new ServiceOrder(
                {
                    clientId: row.client_id,
                    vehicleId: row.vehicle_id,
                    services: row.services,
                    supplies: row.supplies,
                    status: row.status,
                    createdAt: row.created_at,
                    finalizedAt: row.finalized_at
                },
                row.id
            ));
        } catch (error) {
            console.error('Error finding all services:', error);
            throw new Error('Failed to find all service orders');
        }
    }

    async findById(id: number): Promise<ServiceOrder | null> {
        try {
            const result = await db.query(
                `
                SELECT
                    t.id,
                    t.client_id,
                    t.vehicle_id,
                    (
                        SELECT jsonb_agg(srv)
                        FROM (
                        SELECT
                            s.id,
                            s.name,
                            s.description,
                            s.price
                        FROM jsonb_array_elements(t.services::jsonb) AS js
                        JOIN services s ON s.id = (js->>'id')::int
                        ) AS srv
                    ) AS services,
                    (
                        SELECT jsonb_agg(sup)
                        FROM (
                        SELECT
                            sup.id,
                            sup.name,
                            sup.quantity,
                            sup.price
                        FROM jsonb_array_elements(t.supplies::jsonb) AS js
                        JOIN supplies sup ON sup.id = (js->>'id')::int
                        ) AS sup
                    ) AS supplies,
                    t.created_at,
                    t.status,
                    t.finalized_at
                FROM service_orders t   
                WHERE 
                    id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            return new ServiceOrder(
                {
                    clientId: row.client_id,
                    vehicleId: row.vehicle_id,
                    services: row.services,
                    supplies: row.supplies,
                    status: row.status,
                    createdAt: row.created_at,
                    finalizedAt: row.finalized_at
                },
                row.id
            );
        } catch (error) {
            console.error('Error finding service order by id:', error);
            throw new Error('Failed to find service order by id');
        }
    }

    async findOpenOSByCarAndClient(carId: number, client: string): Promise<any> {
        try {
            const result = await db.query(
                `SELECT * FROM 
                    service_orders so
                INNER JOIN clients c ON so.client_id = c.id
                WHERE so.vehicle_id = $1 AND c.identifier = $2 AND so.status NOT IN($3, $4, $5)`,
                [carId, client, ServiceOrderStatus.CANCELLED, ServiceOrderStatus.FINISHED, ServiceOrderStatus.DELIVERED]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new ServiceOrder(
                {
                    clientId: row.client_id,
                    vehicleId: row.vehicle_id,
                    services: row.services,
                    supplies: row.supplies,
                    status: row.status,
                    createdAt: row.created_at,
                    finalizedAt: row.finalized_at
                },
                row.id
            );
        } catch (error) {
            console.error('Error finding service order by car and client:', error);
            throw new Error('Failed to find service order by car and client');
        }
    }
}