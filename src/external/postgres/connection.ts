import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import { DatabaseConnection } from '../../interfaces/connection';

dotenv.config();

export class PostgresDatabaseConnection implements DatabaseConnection {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('connect', () => {
            console.log('Base de Dados conectado com sucesso!');
        });

        this.pool.on('error', (err) => {
            console.error('Erro na conexão com o banco de dados:', err);
        });
    }

    async query<T = any>(text: string, params?: any[]): Promise<T> {
        try {
            const result = await this.pool.query(text, params);
            return result.rows as T;
        } catch (error) {
            console.error('Erro ao executar query:', error);
            throw error;
        }
    }

    async connect(): Promise<void> {
        try {
            const client = await this.pool.connect();
            client.release();
        } catch (error) {
            console.error('Erro ao conectar com o banco:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.pool.end();
            console.log('Conexão com o banco encerrada');
        } catch (error) {
            console.error('Erro ao desconectar do banco:', error);
            throw error;
        }
    }

    async getClient(): Promise<PoolClient> {
        return this.pool.connect();
    }
}

// Instância singleton para reutilização
const databaseConnection = new PostgresDatabaseConnection();

export default databaseConnection;
