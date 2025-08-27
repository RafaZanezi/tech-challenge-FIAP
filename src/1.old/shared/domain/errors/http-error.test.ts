import { HttpError } from './http-error';

// Concrete implementation for testing
class TestHttpError extends HttpError {
    constructor(message: string, statusCode: number) {
        super(message, statusCode);
    }
}

describe('HttpError', () => {
    describe('constructor', () => {
        it('should create an error with correct properties', () => {
            const message = 'Test error message';
            const statusCode = 400;
            
            const error = new TestHttpError(message, statusCode);
            
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(statusCode);
            expect(error.isOperational).toBe(true);
            expect(error.name).toBe('TestHttpError');
        });

        it('should set the error name to constructor name', () => {
            const error = new TestHttpError('Test', 500);
            
            expect(error.name).toBe('TestHttpError');
        });

        it('should capture stack trace', () => {
            const error = new TestHttpError('Test', 500);
            
            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            const message = 'Error occurred';
            const statusCode = 404;
            const error = new TestHttpError(message, statusCode);
            
            const json = error.toJSON();
            
            expect(json.name).toBe('TestHttpError');
            expect(json.message).toBe(message);
            expect(json.statusCode).toBe(statusCode);
            expect(json.timestamp).toBeDefined();
            expect(typeof json.timestamp).toBe('string');
        });

        it('should include timestamp in ISO format', () => {
            const error = new TestHttpError('Test', 500);
            const json = error.toJSON();
            
            // Check if timestamp is a valid ISO string
            const timestamp = new Date(json.timestamp);
            expect(timestamp.toISOString()).toBe(json.timestamp);
        });

        it('should have all required properties in JSON', () => {
            const error = new TestHttpError('Test error', 422);
            const json = error.toJSON();
            
            expect(Object.keys(json)).toEqual(['name', 'message', 'statusCode', 'timestamp']);
        });
    });

    describe('inheritance', () => {
        it('should be instance of Error', () => {
            const error = new TestHttpError('Test', 500);
            
            expect(error instanceof Error).toBe(true);
            expect(error instanceof HttpError).toBe(true);
        });

        it('should preserve Error prototype chain', () => {
            const error = new TestHttpError('Test', 500);
            
            expect(error.name).toBe('TestHttpError');
            expect(error.message).toBe('Test');
        });
    });
});
