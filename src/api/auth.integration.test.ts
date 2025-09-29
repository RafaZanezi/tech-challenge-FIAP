import request from 'supertest';
import express from 'express';
import { AuthAPI } from './auth';
import { TestDatabaseConnection } from '../../test/setup/integration-test-setup';

describe('Auth API Integration Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        
        app = express();
        app.use(express.json());
        
        const authAPI = new AuthAPI(testDb);
        app.use('/api', authAPI.getRoutes());
    });

    afterAll(async () => {
        if (testDb) {
            await testDb.cleanup();
            await testDb.disconnect();
        }
    });

    beforeEach(async () => {
        await testDb.cleanup();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'TestUser' + Date.now(),
                password: 'password123',
                role: 'admin'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Usuário criado com sucesso');
            expect(response.body.data.user.name).toBe(userData.name);
            expect(response.body.data.user.role).toBe(userData.role);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'TestUser',
                    password: 'password123'
                    // role missing
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Nome, senha e função são obrigatórios');
        });

        it('should return 400 for invalid role', async () => {
            const userData = {
                name: 'TestUser' + Date.now(),
                password: 'password123',
                role: 'invalid_role'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
        });

        it('should return 409 for duplicate user', async () => {
            const userData = {
                name: 'DuplicateUser',
                password: 'password123',
                role: 'admin'
            };

            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Second registration with same name
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(409);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            // First register a user for this specific test
            const registerData = {
                name: 'LoginTestUser' + Date.now(),
                password: 'password123',
                role: 'admin'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(registerData);
            
            expect(registerResponse.status).toBe(201);

            // Now try to login
            const loginData = {
                name: registerData.name,
                password: registerData.password
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login realizado com sucesso');
            expect(response.body.data.user.name).toBe(loginData.name);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should return 400 for missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'LoginTestUser'
                    // password missing
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Nome e senha são obrigatórios');
        });

        it('should return 401 for invalid username', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'NonExistentUser',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
        });

        it('should return 401 for invalid password', async () => {
            // First register a user
            const registerData = {
                name: 'PasswordTestUser' + Date.now(),
                password: 'password123',
                role: 'admin'
            };

            await request(app)
                .post('/api/auth/register')
                .send(registerData);

            // Try to login with wrong password
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    name: registerData.name,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('Protected Routes', () => {
        describe('GET /api/auth/profile', () => {
            it('should return user profile with valid token', async () => {
                // Create and login a user to get auth token
                const userName = 'ProtectedTestUser' + Date.now();
                const registerResponse = await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: userName,
                        password: 'password123',
                        role: 'admin'
                    });

                const authToken = registerResponse.body.data.token;

                const response = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(response.status).toBe(200);
                expect(response.body.message).toBe('Perfil do usuário');
                expect(response.body.data.name).toBeDefined();
                expect(response.body.data.role).toBeDefined();
                expect(response.body.data.password).toBeUndefined();
            });

            it('should return 401 without token', async () => {
                const response = await request(app)
                    .get('/api/auth/profile');

                expect(response.status).toBe(401);
            });

            it('should return 403 with invalid token', async () => {
                const response = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', 'Bearer invalid_token');

                expect(response.status).toBe(403);
            });
        });

        describe('POST /api/auth/logout', () => {
            it('should logout successfully with valid token', async () => {
                // Create and login a user
                const userName = 'LogoutTestUser' + Date.now();
                const registerResponse = await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: userName,
                        password: 'password123',
                        role: 'admin'
                    });

                const authToken = registerResponse.body.data.token;

                const response = await request(app)
                    .post('/api/auth/logout')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(response.status).toBe(200);
                expect(response.body.message).toBe('Logout realizado com sucesso');

                // Verify token is now blacklisted
                const profileResponse = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(profileResponse.status).toBe(403);
            });

            it('should return 401 without token', async () => {
                const response = await request(app)
                    .post('/api/auth/logout');

                expect(response.status).toBe(401);
            });
        });
    });
});