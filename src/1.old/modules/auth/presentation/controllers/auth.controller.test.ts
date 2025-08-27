import AuthController from './auth.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

describe('AuthController', () => {
    let authController: AuthController;
    let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
    let mockLoginUserUseCase: jest.Mocked<LoginUserUseCase>;
    let mockLogoutUserUseCase: jest.Mocked<LogoutUserUseCase>;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        mockCreateUserUseCase = {
            execute: jest.fn()
        } as any;

        mockLoginUserUseCase = {
            execute: jest.fn()
        } as any;

        mockLogoutUserUseCase = {
            execute: jest.fn()
        } as any;

        authController = new AuthController(
            mockCreateUserUseCase,
            mockLoginUserUseCase,
            mockLogoutUserUseCase
        );

        mockReq = {
            body: {},
            headers: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            // Arrange
            const userData = { name: 'Test User', role: UserRole.MECHANIC, password: 'password' };
            const expectedResponse = { 
                id: 1, 
                name: 'Test User', 
                role: UserRole.MECHANIC 
            };
            
            mockReq.body = userData;
            mockCreateUserUseCase.execute.mockResolvedValue(expectedResponse);

            // Act
            await authController.register(mockReq, mockRes);

            // Assert
            expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: expectedResponse
            });
        });

        it('should handle errors with status code', async () => {
            // Arrange
            const error = {
                statusCode: 400,
                message: 'Invalid user data'
            };
            
            mockCreateUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.register(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid user data'
            });
        });

        it('should handle errors without status code', async () => {
            // Arrange
            const error = new Error('Database error');
            mockCreateUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.register(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });

        it('should handle errors without message', async () => {
            // Arrange
            const error = { statusCode: 500 };
            mockCreateUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.register(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ocorreu um erro ao processar'
            });
        });

        it('should handle null error', async () => {
            // Arrange
            mockCreateUserUseCase.execute.mockRejectedValue(null);

            // Act
            await authController.register(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ocorreu um erro ao processar'
            });
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            // Arrange
            const loginData = { name: 'test@test.com', password: 'password' };
            const expectedResponse = { 
                id: 1, 
                name: 'Test User',
                role: 'mechanic',
                token: 'jwt-token'
            };
            
            mockReq.body = loginData;
            mockLoginUserUseCase.execute.mockResolvedValue(expectedResponse);

            // Act
            await authController.login(mockReq, mockRes);

            // Assert
            expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(loginData);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: expectedResponse
            });
        });

        it('should handle login errors with status code', async () => {
            // Arrange
            const error = {
                statusCode: 401,
                message: 'Invalid credentials'
            };
            
            mockLoginUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.login(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid credentials'
            });
        });

        it('should handle login errors without status code', async () => {
            // Arrange
            const error = new Error('Service unavailable');
            mockLoginUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.login(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service unavailable'
            });
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            // Arrange
            const expectedResponse = 'Logout realizado com sucesso';
            mockLogoutUserUseCase.execute.mockResolvedValue(expectedResponse);

            // Act
            await authController.logout(mockReq, mockRes);

            // Assert
            expect(mockLogoutUserUseCase.execute).toHaveBeenCalledWith(mockReq);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: expectedResponse
            });
        });

        it('should handle logout errors with status code', async () => {
            // Arrange
            const error = {
                statusCode: 400,
                message: 'Invalid token'
            };
            
            mockLogoutUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.logout(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
        });

        it('should handle logout errors without status code', async () => {
            // Arrange
            const error = new Error('Token processing failed');
            mockLogoutUserUseCase.execute.mockRejectedValue(error);

            // Act
            await authController.logout(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token processing failed'
            });
        });
    });
});
