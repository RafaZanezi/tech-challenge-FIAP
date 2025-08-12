import routes from './routes';
import express from 'express';

describe('Routes Configuration', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
    });

    it('should setup routes correctly', () => {
        // Test that routes function executes without errors
        expect(() => routes(app)).not.toThrow();
    });

    it('should configure root route', () => {
        routes(app);
        
        // Verify that the app has routes configured
        expect(app._router).toBeDefined();
    });

    it('should configure root route with correct handler', () => {
        const mockGet = jest.fn();
        const mockRoute = {
            get: mockGet
        };
        
        jest.spyOn(app, 'route').mockReturnValue(mockRoute as any);
        jest.spyOn(app, 'use').mockImplementation();

        routes(app);

        expect(app.route).toHaveBeenCalledWith('/');
        expect(mockGet).toHaveBeenCalledWith(expect.any(Function));

        // Test the actual handler
        const handler = mockGet.mock.calls[0][0];
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        handler({}, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            title: 'Bem vindo ao Sistema Integrado de Atendimento e Execução de Serviços'
        });
    });

});
