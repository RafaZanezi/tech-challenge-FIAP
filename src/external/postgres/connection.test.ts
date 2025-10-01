import { PostgresDatabaseConnection } from './connection';
import { Pool } from 'pg';

// Mock da biblioteca pg
jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
    }))
}));

// Mock do dotenv
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('PostgresDatabaseConnection', () => {
    let connection: PostgresDatabaseConnection;
    let mockPool: jest.Mocked<Pool>;
    let originalEnv: typeof process.env;

    beforeEach(() => {
        // Salva as variáveis de ambiente originais
        originalEnv = process.env;
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

        // Mock do pool
        mockPool = {
            query: jest.fn(),
            connect: jest.fn(),
            end: jest.fn(),
            on: jest.fn()
        } as any;

        (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => mockPool);

        // Limpa os console.log/error para não poluir os testes
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();

        connection = new PostgresDatabaseConnection();
    });

    afterEach(() => {
        // Restaura as variáveis de ambiente
        process.env = originalEnv;
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create Pool with correct configuration', () => {
            expect(Pool).toHaveBeenCalledWith({
                connectionString: 'postgresql://test:test@localhost:5432/testdb',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        });

        it('should set up event listeners', () => {
            expect(mockPool.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
        });

        it('should handle connect event', () => {
            const connectHandler = (mockPool.on as jest.Mock).mock.calls.find(
                call => call[0] === 'connect'
            )[1];

            connectHandler();

            expect(console.log).toHaveBeenCalledWith('Base de Dados conectado com sucesso!');
        });

        it('should handle error event', () => {
            const errorHandler = (mockPool.on as jest.Mock).mock.calls.find(
                call => call[0] === 'error'
            )[1];

            const testError = new Error('Connection error');
            errorHandler(testError);

            expect(console.error).toHaveBeenCalledWith('Erro na conexão com o banco de dados:', testError);
        });
    });

    describe('query', () => {
        it('should execute query and return rows', async () => {
            const mockResult = { rows: [{ id: 1, name: 'Test' }] };
            mockPool.query.mockResolvedValue(mockResult);

            const result = await connection.query('SELECT * FROM test', []);

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
            expect(result).toEqual([{ id: 1, name: 'Test' }]);
        });

        it('should execute query without parameters', async () => {
            const mockResult = { rows: [{ count: 5 }] };
            mockPool.query.mockResolvedValue(mockResult);

            const result = await connection.query('SELECT COUNT(*) FROM users');

            expect(mockPool.query).toHaveBeenCalledWith('SELECT COUNT(*) FROM users', undefined);
            expect(result).toEqual([{ count: 5 }]);
        });

        it('should handle query errors', async () => {
            const error = new Error('Query failed');
            mockPool.query.mockRejectedValue(error);

            await expect(connection.query('INVALID SQL')).rejects.toThrow('Query failed');
            expect(console.error).toHaveBeenCalledWith('Erro ao executar query:', error);
        });

        it('should handle empty result', async () => {
            const mockResult = { rows: [] };
            mockPool.query.mockResolvedValue(mockResult);

            const result = await connection.query('SELECT * FROM empty_table');

            expect(result).toEqual([]);
        });
    });

    describe('connect', () => {
        it('should connect and release client', async () => {
            const mockClient = { release: jest.fn() };
            mockPool.connect.mockResolvedValue(mockClient as any);

            await connection.connect();

            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should handle connection errors', async () => {
            const error = new Error('Connection failed');
            mockPool.connect.mockRejectedValue(error);

            await expect(connection.connect()).rejects.toThrow('Connection failed');
            expect(console.error).toHaveBeenCalledWith('Erro ao conectar com o banco:', error);
        });
    });

    describe('disconnect', () => {
        it('should end pool connection', async () => {
            mockPool.end.mockResolvedValue(undefined);

            await connection.disconnect();

            expect(mockPool.end).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Conexão com o banco encerrada');
        });

        it('should handle disconnection errors', async () => {
            const error = new Error('Disconnection failed');
            mockPool.end.mockRejectedValue(error);

            await expect(connection.disconnect()).rejects.toThrow('Disconnection failed');
            expect(console.error).toHaveBeenCalledWith('Erro ao desconectar do banco:', error);
        });
    });

    describe('getClient', () => {
        it('should return pool client', async () => {
            const mockClient = { query: jest.fn(), release: jest.fn() };
            mockPool.connect.mockResolvedValue(mockClient as any);

            const client = await connection.getClient();

            expect(mockPool.connect).toHaveBeenCalled();
            expect(client).toBe(mockClient);
        });

        it('should handle client connection errors', async () => {
            const error = new Error('Client connection failed');
            mockPool.connect.mockRejectedValue(error);

            await expect(connection.getClient()).rejects.toThrow('Client connection failed');
        });
    });

    describe('with different environment configurations', () => {
        it('should handle missing DATABASE_URL', () => {
            delete process.env.DATABASE_URL;

            // Create new instance to test with missing env var
            const newConnection = new PostgresDatabaseConnection();

            expect(Pool).toHaveBeenCalledWith({
                connectionString: undefined,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        });
    });
});