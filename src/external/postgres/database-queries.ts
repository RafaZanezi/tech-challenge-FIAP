import { DatabaseConnection } from "../../interfaces/connection";

export class PostgresConnection {
    private db: DatabaseConnection;

    constructor(dbConnection: DatabaseConnection) {
        this.db = dbConnection;
    }

    async findByParams<T>(table: string, fields: string[] | null, params: Record<string, any>): Promise<T> {
        const selectFields = fields ? fields.join(", ") : "*";
        const { clause, values } = this.buildWhereClause(params);

        const query = `SELECT ${selectFields} FROM ${table} WHERE ${clause}`;
        const result = await this.db.query(query, values);
        
        return result.rows[0] as T;
    }

    async findAll<T>(table: string, fields: string[] | null): Promise<T> {
        const selectFields = fields ? fields.join(", ") : "*";
        const query = `SELECT ${selectFields} FROM ${table}`;
        const result = await this.db.query(query);

        return result.rows as T;
    }

    async findAllByParams<T>(table: string, fields: string[] | null, params: Record<string, any>): Promise<T[]> {
        const selectFields = fields ? fields.join(", ") : "*";
        const { clause, values } = this.buildWhereClause(params);

        const query = `SELECT ${selectFields} FROM ${table} WHERE ${clause}`;
        const result = await this.db.query(query, values);

        return result.rows as T[];
    }

    async insert<T>(table: string, data: any): Promise<T> {
        // Handle entity objects with toDatabase method, otherwise use the object directly
        const dataToInsert = data.toDatabase ? data.toDatabase() : data;
        
        const keys = Object.keys(dataToInsert);
        const values = Object.values(dataToInsert);
        
        // Convert camelCase to snake_case for database columns
        const dbKeys = keys.map(key => this.camelToSnake(key));
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

        const query = `INSERT INTO ${table} (${dbKeys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
       
        const result = await this.db.query(query, values);

        return result.rows[0] as T;
    }

    async update<T>(table: string, id: number, data: Partial<T>): Promise<T> {
        const keys = Object.keys(data as Record<string, any>);
        const values = Object.values(data as Record<string, any>);
        
        // Convert camelCase to snake_case for database columns
        const dbKeys = keys.map(key => this.camelToSnake(key));
        const setClause = dbKeys.map((key, index) => `${key} = $${index + 1}`).join(", ");

        const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
        const result = await this.db.query(query, [...values, id]);

        return result.rows[0] as T;
    }

    async delete(table: string, id: number): Promise<void> {
        const query = `DELETE FROM ${table} WHERE id = $1`;
        await this.db.query(query, [id]);
    }

    async customQuery<T>(query: string, params: any[] = []): Promise<T> {
        const result = await this.db.query(query, params);
        return result.rows as T;
    }

    private buildWhereClause(params: Record<string, any>): { clause: string; values: any[] } {
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.keys(params).forEach(key => {
            const dbKey = this.camelToSnake(key);
            const value = params[key];
            
            if (Array.isArray(value)) {
                // Handle IN clause for arrays
                const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
                conditions.push(`${dbKey} IN (${placeholders})`);
                values.push(...value);
            } else {
                conditions.push(`${dbKey} = $${paramIndex++}`);
                values.push(value);
            }
        });

        return {
            clause: conditions.join(" AND "),
            values
        };
    }

    private camelToSnake(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}