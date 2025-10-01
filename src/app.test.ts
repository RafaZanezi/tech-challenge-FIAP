import { Pool } from 'pg';
import { WorkshopApp } from './api';

// Mock das dependências
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        on: jest.fn()
    }))
}));

jest.mock('./api', () => ({
    WorkshopApp: jest.fn().mockImplementation(() => ({
        start: jest.fn()
    }))
}));

describe('App', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // Define variável de ambiente para o teste
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
        // Mock console.log para capturar as chamadas
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should configure dotenv', () => {
        const dotenv = require('dotenv');
        
        // Re-import to trigger the module execution
        jest.isolateModules(() => {
            require('./app');
        });

        expect(dotenv.config).toHaveBeenCalled();
    });

    it('should create PostgreSQL connection pool with correct configuration', () => {
        jest.isolateModules(() => {
            require('./app');
        });

        expect(Pool).toHaveBeenCalledWith({
            connectionString: 'postgresql://test:test@localhost:5432/testdb'
        });
    });

    it('should set up connection event handler', () => {
        let mockPool: any;
        (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => {
            mockPool = {
                on: jest.fn()
            };
            return mockPool;
        });

        jest.isolateModules(() => {
            require('./app');
        });

        expect(mockPool.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('should log success message on database connection', () => {
        let mockPool: any;
        let connectHandler: Function;

        (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => {
            mockPool = {
                on: jest.fn().mockImplementation((event, handler) => {
                    if (event === 'connect') {
                        connectHandler = handler;
                    }
                })
            };
            return mockPool;
        });

        jest.isolateModules(() => {
            require('./app');
        });

        // Trigger the connect handler
        connectHandler();

        expect(consoleLogSpy).toHaveBeenCalledWith('Base de Dados conectado com sucesso!');
    });

    it('should create WorkshopApp with postgres connection', () => {
        let mockPool: any;

        (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => {
            mockPool = {
                on: jest.fn()
            };
            return mockPool;
        });

        jest.isolateModules(() => {
            require('./app');
        });

        expect(WorkshopApp).toHaveBeenCalledWith(mockPool);
    });

    it('should start the workshop application', () => {
        let mockApp: any;

        (WorkshopApp as jest.MockedClass<typeof WorkshopApp>).mockImplementation(() => {
            mockApp = {
                start: jest.fn()
            };
            return mockApp;
        });

        jest.isolateModules(() => {
            require('./app');
        });

        expect(mockApp.start).toHaveBeenCalled();
    });

    it('should handle missing DATABASE_URL environment variable', () => {
        delete process.env.DATABASE_URL;

        jest.isolateModules(() => {
            require('./app');
        });

        expect(Pool).toHaveBeenCalledWith({
            connectionString: undefined
        });
    });
});