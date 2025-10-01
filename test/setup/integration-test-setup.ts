import express from 'express';
import { Pool } from 'pg';
import { PostgresDatabaseConnection } from '../../src/external/postgres/connection';
import { WorkshopApp } from '../../src/api';

// Mock do banco de dados para testes de integração
export class TestDatabaseConnection extends PostgresDatabaseConnection {
    private testPool: Pool;

    constructor() {
        super();
        this.testPool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async query<T = any>(text: string, params?: any[]): Promise<T> {
        try {
            const result = await this.testPool.query(text, params);
            return result.rows as T;
        } catch (error) {
            console.error('Erro ao executar query no teste:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        // Limpa tabelas específicas para os testes na ordem correta para evitar problemas de FK
        try {
            await this.testPool.query('DELETE FROM service_orders');
            await this.testPool.query('DELETE FROM vehicles');
            await this.testPool.query('DELETE FROM clients');
            await this.testPool.query('DELETE FROM services');
            await this.testPool.query('DELETE FROM supplies');
            await this.testPool.query('DELETE FROM users');
            
            // Reset sequences
            await this.testPool.query('ALTER SEQUENCE clients_id_seq RESTART WITH 1');
            await this.testPool.query('ALTER SEQUENCE vehicles_id_seq RESTART WITH 1');
            await this.testPool.query('ALTER SEQUENCE services_id_seq RESTART WITH 1');
            await this.testPool.query('ALTER SEQUENCE supplies_id_seq RESTART WITH 1');
            await this.testPool.query('ALTER SEQUENCE service_orders_id_seq RESTART WITH 1');
            await this.testPool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        } catch (error) {
            console.warn('Erro ao limpar tabelas de teste:', error);
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.testPool.end();
        } catch (error) {
            console.error('Erro ao desconectar do banco de teste:', error);
        }
    }

    // Sobrescrever o método getClient também
    async getClient() {
        return this.testPool.connect();
    }
}

export function createTestApp() {
    const testDb = new TestDatabaseConnection();
    const app = new WorkshopApp(testDb);
    return { app, testDb };
}

// Helper para dados de teste válidos
export const testData = {
    validClient: {
        name: 'João Silva',
        identifier: '11144477735'
    },
    validVehicle: {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        clientId: 1
    },
    validService: {
        name: 'Troca de Óleo',
        description: 'Troca completa do óleo do motor',
        price: 150.00
    },
    validSupply: {
        name: 'Óleo 5W30',
        quantity: 10,
        price: 45.00
    }
};

// CPF válido para testes (seguindo algoritmo de validação)
export const validCPF = '11144477735';
export const invalidCPF = '12345678900';
