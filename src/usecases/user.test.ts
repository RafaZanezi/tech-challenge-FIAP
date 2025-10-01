import { UserUseCases } from './user';
import { User, UserRole } from '../entities/auth-user';
import { UserGatewayInterface } from '../interfaces/gateways';
import { ConflictError, ValidationError } from './errors/errors';
import { NotFoundHttpError, UnauthorizedError } from '../api/errors/http-errors';

// Mock do JWT
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

const jwt = require('jsonwebtoken');

describe('UserUseCases', () => {
    let userUseCases: UserUseCases;
    let mockUserGateway: jest.Mocked<UserGatewayInterface>;

    beforeEach(() => {
        mockUserGateway = {
            insert: jest.fn(),
            findByName: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        userUseCases = new UserUseCases(mockUserGateway);
        process.env.JWT_SECRET = 'test-secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.JWT_SECRET;
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const mockSavedUser = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockUserGateway.findByName.mockResolvedValue(null);
            mockUserGateway.insert.mockResolvedValue(mockSavedUser);
            jwt.sign.mockReturnValue('mocked-token');

            const result = await userUseCases.registerUser('testuser', 'password123', UserRole.ADMIN);

            expect(mockUserGateway.findByName).toHaveBeenCalledWith('testuser');
            expect(mockUserGateway.insert).toHaveBeenCalled();
            expect(result.user).toBeInstanceOf(User);
            expect(result.user.name).toBe('testuser');
            expect(result.token).toBe('mocked-token');
        });

        it('should throw ValidationError for invalid role', async () => {
            await expect(
                userUseCases.registerUser('testuser', 'password123', 'INVALID_ROLE')
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ConflictError if user already exists', async () => {
            const existingUser = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockUserGateway.findByName.mockResolvedValue(existingUser);

            await expect(
                userUseCases.registerUser('testuser', 'password123', UserRole.ADMIN)
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('getUserById', () => {
        it('should return user by id', async () => {
            const mockUserDTO = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockUserGateway.findById.mockResolvedValue(mockUserDTO);

            const result = await userUseCases.getUserById(1);

            expect(mockUserGateway.findById).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(User);
            expect(result.name).toBe('testuser');
            expect(result.id).toBe(1);
        });

        it('should throw NotFoundHttpError if user not found', async () => {
            mockUserGateway.findById.mockResolvedValue(null);

            await expect(
                userUseCases.getUserById(999)
            ).rejects.toThrow(NotFoundHttpError);
        });
    });
});