import { DatabaseConnection } from "../../interfaces/connection";

export class PostgresConnection {
    private db: DatabaseConnection;

    constructor(dbConnection: DatabaseConnection) {
        this.db = dbConnection;
    }

    async findByParams<T>(table: string, fields: string[] | null, params: Record<string, any>): Promise<T> {
        const selectFields = fields ? fields.join(", ") : "*";
        const whereClause = this.buildWhereClause(params);
        const paramValues = Object.values(params);
        
        const query = `SELECT ${selectFields} FROM ${table} WHERE ${whereClause}`;
        const result = await this.db.query<T[]>(query, paramValues);
        
        return Array.isArray(result) && result.length > 0 ? result[0] : null as T;
    }

    async findAll<T>(table: string, fields: string[] | null): Promise<T> {
        const selectFields = fields ? fields.join(", ") : "*";
        const query = `SELECT ${selectFields} FROM ${table}`;
        
        return this.db.query<T>(query);
    }

    async insert<T>(table: string, data: T): Promise<T> {
        const keys = Object.keys(data as Record<string, any>);
        const values = Object.values(data as Record<string, any>);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
        
        const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
        const result = await this.db.query<T[]>(query, values);
        
        return Array.isArray(result) && result.length > 0 ? result[0] : result as T;
    }

    async update<T>(table: string, id: number, data: Partial<T>): Promise<T> {
        const setClause = this.buildSetClause(data as Record<string, any>);
        const values = Object.values(data as Record<string, any>);
        
        const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
        const result = await this.db.query<T[]>(query, [...values, id]);
        
        return Array.isArray(result) && result.length > 0 ? result[0] : result as T;
    }

    async delete(table: string, id: number): Promise<void> {
        const query = `DELETE FROM ${table} WHERE id = $1`;
        await this.db.query(query, [id]);
    }

    private buildWhereClause(params: Record<string, any>): string {
        return Object.keys(params)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(" AND ");
    }

    private buildSetClause(data: Record<string, any>): string {
        return Object.keys(data)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
    }
}