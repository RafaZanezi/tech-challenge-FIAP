import { Request, Response } from 'express';
import { AuthController } from './auth';
import { DatabaseConnection } from '../interfaces/connection';
import { UserGateway } from '../gateways/user';
import { UserUseCases } from '../usecases/user';
import { AuthPresenter } from '../presenters/auth';
import { AuthenticatedRequest, addToBlacklist } from '../api/middlewares';
import { verifyAndReturnError } from '../presenters/verify-and-return-error';
import { User, UserRole } from '../entities/auth-user';

// Mocks
jest.mock('../gateways/user');
jest.mock('../usecases/user');
jest.mock('../presenters/auth');
jest.mock('../presenters/verify-and-return-error');
jest.mock('../api/middlewares', () => ({
    addToBlacklist: jest.fn()
}));

describe('AuthController', () => {
    let authController: AuthController;
    let mockDbConnection: jest.Mocked<DatabaseConnection>;
    let mockUserGateway: jest.Mocked<UserGateway>;
    let mockUserUseCase: jest.Mocked<UserUseCases>;
    let mockAuthPresenter: jest.Mocked<AuthPresenter>;
    let mockReq: Partial<Request | AuthenticatedRequest>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockDbConnection = {
            query: jest.fn()
        } as unknown as jest.Mocked<DatabaseConnection>;

        mockUserGateway = {
            findByName: jest.fn(),
            insert: jest.fn(),
            findById: jest.fn()
        } as unknown as jest.Mocked<UserGateway>;

        mockUserUseCase = {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            getUserById: jest.fn()
        } as unknown as jest.Mocked<UserUseCases>;

        mockAuthPresenter = {
            presentBadRequest: jest.fn(),
            presentRegister: jest.fn(),
            presentLogin: jest.fn(),
            presentLogout: jest.fn(),
            presentProfile: jest.fn(),
            presentUnauthorized: jest.fn(),
            getStatusCode: jest.fn().mockReturnValue(200),
            getResponse: jest.fn().mockReturnValue({ success: true })
        } as unknown as jest.Mocked<AuthPresenter>;

        mockReq = {
            body: {},
            headers: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        (UserGateway as jest.MockedClass<typeof UserGateway>).mockImplementation(() => mockUserGateway);
        (UserUseCases as jest.MockedClass<typeof UserUseCases>).mockImplementation(() => mockUserUseCase);
        (AuthPresenter as jest.MockedClass<typeof AuthPresenter>).mockImplementation(() => mockAuthPresenter);

        authController = new AuthController(mockDbConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct dependencies', () => {
            expect(UserGateway).toHaveBeenCalledWith(mockDbConnection);
            expect(UserUseCases).toHaveBeenCalledWith(mockUserGateway);
        });
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            mockReq.body = { name: 'testuser', password: 'password123', role: 'admin' };
            const mockUser = new User({ name: 'testuser', password: 'password123', role: UserRole.ADMIN }, 1);
            const mockResult = { user: mockUser, token: 'token123' };
            mockUserUseCase.registerUser.mockResolvedValue(mockResult);

            await authController.register(mockReq as Request, mockRes as Response);

            expect(mockUserUseCase.registerUser).toHaveBeenCalledWith('testuser', 'password123', 'admin');
            expect(mockAuthPresenter.presentRegister).toHaveBeenCalledWith(mockResult.user, mockResult.token);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({ success: true });
        });

        it('should return bad request when name is missing', async () => {
            mockReq.body = { password: 'password123', role: 'admin' };

            await authController.register(mockReq as Request, mockRes as Response);

            expect(mockAuthPresenter.presentBadRequest).toHaveBeenCalledWith('Nome, senha e função são obrigatórios');
            expect(mockUserUseCase.registerUser).not.toHaveBeenCalled();
        });

        it('should return bad request when password is missing', async () => {
            mockReq.body = { name: 'testuser', role: 'admin' };

            await authController.register(mockReq as Request, mockRes as Response);

            expect(mockAuthPresenter.presentBadRequest).toHaveBeenCalledWith('Nome, senha e função são obrigatórios');
            expect(mockUserUseCase.registerUser).not.toHaveBeenCalled();
        });

        it('should return bad request when role is missing', async () => {
            mockReq.body = { name: 'testuser', password: 'password123' };

            await authController.register(mockReq as Request, mockRes as Response);

            expect(mockAuthPresenter.presentBadRequest).toHaveBeenCalledWith('Nome, senha e função são obrigatórios');
            expect(mockUserUseCase.registerUser).not.toHaveBeenCalled();
        });

        it('should handle errors in register', async () => {
            mockReq.body = { name: 'testuser', password: 'password123', role: 'admin' };
            const error = new Error('Registration failed');
            mockUserUseCase.registerUser.mockRejectedValue(error);

            await authController.register(mockReq as Request, mockRes as Response);

            expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            mockReq.body = { name: 'testuser', password: 'password123' };
            const mockUser = new User({ name: 'testuser', password: 'password123', role: UserRole.ADMIN }, 1);
            const mockResult = { user: mockUser, token: 'token123' };
            mockUserUseCase.loginUser.mockResolvedValue(mockResult);

            await authController.login(mockReq as Request, mockRes as Response);

            expect(mockUserUseCase.loginUser).toHaveBeenCalledWith('testuser', 'password123');
            expect(mockAuthPresenter.presentLogin).toHaveBeenCalledWith(mockResult.user, mockResult.token);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({ success: true });
        });

        it('should return bad request when name is missing', async () => {
            mockReq.body = { password: 'password123' };

            await authController.login(mockReq as Request, mockRes as Response);

            expect(mockAuthPresenter.presentBadRequest).toHaveBeenCalledWith('Nome e senha são obrigatórios');
            expect(mockUserUseCase.loginUser).not.toHaveBeenCalled();
        });

        it('should return bad request when password is missing', async () => {
            mockReq.body = { name: 'testuser' };

            await authController.login(mockReq as Request, mockRes as Response);

            expect(mockAuthPresenter.presentBadRequest).toHaveBeenCalledWith('Nome e senha são obrigatórios');
            expect(mockUserUseCase.loginUser).not.toHaveBeenCalled();
        });

        it('should handle errors in login', async () => {
            mockReq.body = { name: 'testuser', password: 'password123' };
            const error = new Error('Login failed');
            mockUserUseCase.loginUser.mockRejectedValue(error);

            await authController.login(mockReq as Request, mockRes as Response);

            expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
        });
    });

    describe('logout', () => {
        it('should logout user successfully with token', async () => {
            const token = 'Bearer token123';
            (mockReq as AuthenticatedRequest).headers = { authorization: token };

            await authController.logout(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(addToBlacklist).toHaveBeenCalledWith('token123');
            expect(mockAuthPresenter.presentLogout).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({ success: true });
        });

        it('should logout user successfully without token', async () => {
            (mockReq as AuthenticatedRequest).headers = {};

            await authController.logout(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(addToBlacklist).not.toHaveBeenCalled();
            expect(mockAuthPresenter.presentLogout).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({ success: true });
        });

        it('should handle errors in logout', async () => {
            const error = new Error('Logout failed');
            mockAuthPresenter.presentLogout.mockImplementation(() => {
                throw error;
            });

            await authController.logout(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
        });
    });

    describe('profile', () => {
        it('should return user profile successfully', async () => {
            const mockUser = new User({ name: 'testuser', password: 'password123', role: UserRole.ADMIN }, 1);
            (mockReq as AuthenticatedRequest).user = { id: '1', role: UserRole.ADMIN };
            mockUserUseCase.getUserById.mockResolvedValue(mockUser);

            await authController.profile(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(mockUserUseCase.getUserById).toHaveBeenCalledWith(1);
            expect(mockAuthPresenter.presentProfile).toHaveBeenCalledWith(mockUser);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({ success: true });
        });

        it('should return unauthorized when user is not authenticated', async () => {
            (mockReq as AuthenticatedRequest).user = undefined;

            await authController.profile(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(mockAuthPresenter.presentUnauthorized).toHaveBeenCalledWith('Usuário não autenticado');
            expect(mockUserUseCase.getUserById).not.toHaveBeenCalled();
        });

        it('should return unauthorized when user id is missing', async () => {
            (mockReq as AuthenticatedRequest).user = { role: UserRole.ADMIN } as any;

            await authController.profile(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(mockAuthPresenter.presentUnauthorized).toHaveBeenCalledWith('Usuário não autenticado');
            expect(mockUserUseCase.getUserById).not.toHaveBeenCalled();
        });

        it('should handle errors in profile', async () => {
            (mockReq as AuthenticatedRequest).user = { id: '1', role: UserRole.ADMIN };
            const error = new Error('Profile failed');
            mockUserUseCase.getUserById.mockRejectedValue(error);

            await authController.profile(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(verifyAndReturnError).toHaveBeenCalledWith(error, mockRes);
        });
    });
});