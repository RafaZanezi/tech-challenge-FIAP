import { UserGateway } from './user';
import { User, UserRole } from '../entities/auth-user';
import { DatabaseConnection } from '../interfaces/connection';
import { PostgresConnection } from '../external/postgres/database-queries';

// Mock the PostgresConnection class
jest.mock('../external/postgres/database-queries');

describe('UserGateway', () => {
    let userGateway: UserGateway;
    let mockDbConnection: jest.Mocked<DatabaseConnection>;
    let mockPostgresConnection: jest.Mocked<PostgresConnection>;

    beforeEach(() => {
        mockDbConnection = {
            query: jest.fn(),
            connect: jest.fn(),
            disconnect: jest.fn(),
        };

        mockPostgresConnection = {
            findByParams: jest.fn(),
            insert: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        (PostgresConnection as jest.MockedClass<typeof PostgresConnection>).mockImplementation(() => mockPostgresConnection);

        userGateway = new UserGateway(mockDbConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('insert', () => {
        it('should insert a new user successfully', async () => {
            const user = new User({
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            });

            const mockResult = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockPostgresConnection.insert.mockResolvedValue(mockResult);

            const result = await userGateway.insert(user);

            expect(mockPostgresConnection.insert).toHaveBeenCalledWith('users', user);
            expect(result).toEqual(mockResult);
        });

        it('should handle database errors during insert', async () => {
            const user = new User({
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            });

            mockPostgresConnection.insert.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.insert(user)).rejects.toThrow('Database error');
        });
    });

    describe('findByName', () => {
        it('should find user by name successfully', async () => {
            const mockResult = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockPostgresConnection.findByParams.mockResolvedValue(mockResult);

            const result = await userGateway.findByName('testuser');

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('users', null, { name: 'testuser' });
            expect(result).toEqual(mockResult);
        });

        it('should return null when user not found', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await userGateway.findByName('nonexistent');

            expect(result).toBeNull();
        });

        it('should handle database errors during findByName', async () => {
            mockPostgresConnection.findByParams.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.findByName('testuser')).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should find user by id successfully', async () => {
            const mockResult = {
                id: 1,
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            };

            mockPostgresConnection.findByParams.mockResolvedValue(mockResult);

            const result = await userGateway.findById(1);

            expect(mockPostgresConnection.findByParams).toHaveBeenCalledWith('users', null, { id: 1 });
            expect(result).toEqual(mockResult);
        });

        it('should return null when user not found by id', async () => {
            mockPostgresConnection.findByParams.mockResolvedValue(null);

            const result = await userGateway.findById(999);

            expect(result).toBeNull();
        });

        it('should handle database errors during findById', async () => {
            mockPostgresConnection.findByParams.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.findById(1)).rejects.toThrow('Database error');
        });
    });

    describe('findAll', () => {
        it('should find all users successfully', async () => {
            const mockResults = [
                {
                    id: 1,
                    name: 'user1',
                    password: 'hash1',
                    role: UserRole.ADMIN
                },
                {
                    id: 2,
                    name: 'user2',
                    password: 'hash2',
                    role: UserRole.MECHANIC
                }
            ];

            mockPostgresConnection.findAll.mockResolvedValue(mockResults);

            const result = await userGateway.findAll();

            expect(mockPostgresConnection.findAll).toHaveBeenCalledWith('users', null);
            expect(result).toEqual(mockResults);
        });

        it('should return empty array when no users found', async () => {
            mockPostgresConnection.findAll.mockResolvedValue([]);

            const result = await userGateway.findAll();

            expect(result).toEqual([]);
        });

        it('should handle database errors during findAll', async () => {
            mockPostgresConnection.findAll.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            const userData = {
                name: 'updateduser',
                password: 'newhash',
                role: UserRole.MECHANIC
            };

            const mockResult = {
                id: 1,
                name: 'updateduser',
                password: 'newhash',
                role: UserRole.MECHANIC
            };

            mockPostgresConnection.update.mockResolvedValue(mockResult);

            const result = await userGateway.update(1, userData);

            expect(mockPostgresConnection.update).toHaveBeenCalledWith('users', 1, userData);
            expect(result).toEqual(mockResult);
        });

        it('should handle database errors during update', async () => {
            const userData = {
                name: 'updateduser',
                password: 'newhash',
                role: UserRole.MECHANIC
            };

            mockPostgresConnection.update.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.update(1, userData)).rejects.toThrow('Database error');
        });
    });

    describe('delete', () => {
        it('should delete user successfully', async () => {
            mockPostgresConnection.delete.mockResolvedValue(undefined);

            await userGateway.delete(1);

            expect(mockPostgresConnection.delete).toHaveBeenCalledWith('users', 1);
        });

        it('should handle database errors during delete', async () => {
            mockPostgresConnection.delete.mockRejectedValue(new Error('Database error'));

            await expect(userGateway.delete(1)).rejects.toThrow('Database error');
        });
    });
});