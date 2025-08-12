import request from 'supertest';
import app from '../../../../main/app';
import { authMock } from './auth.mock';

describe('Auth API Integration Tests', () => {
    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const uniqueUser = `test-${Date.now()}User`;
            const res = await request(app)
                .post('/auth/register')
                .send({
                    "name": uniqueUser,
                    "role": "admin",
                    "password": "password"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('data.name', uniqueUser);
            expect(res.body).toHaveProperty('data.role', 'admin');
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('id');
        });

        it('should fail with missing name', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    "role": "admin",
                    "password": "password"
                });

            expect(res.status).toBe(400);
        });

        it('should fail with missing password', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    "name": "testuser",
                    "role": "admin"
                });

            expect(res.status).toBe(400);
        });

        it('should fail with missing role', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    "name": "testuser",
                    "password": "password"
                });

            expect(res.status).toBe(400);
        });

        it('should fail when registering duplicate user', async () => {
            const userData = {
                "name": `duplicate-${Date.now()}`,
                "role": "admin",
                "password": "password"
            };

            // Register first user
            await request(app)
                .post('/auth/register')
                .send(userData);

            // Try to register same user again
            const res = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(res.status).toBe(409);
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await request(app)
                .post('/auth/register')
                .send(authMock);
        });

        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    name: authMock.user,
                    password: authMock.password
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data.token');
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.props).toHaveProperty('name', authMock.user);
            expect(res.body.data.props).toHaveProperty('role');
        });

        it('should return user data with valid token structure', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    name: authMock.user,
                    password: authMock.password
                });

            expect(res.status).toBe(200);
            expect(res.body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
            expect(typeof res.body.data._id).toBe('number');
        });

        it('should fail with missing name', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    password: authMock.password
                });

            expect(res.status).toBe(400);
        });

        it('should fail with missing password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    name: authMock.user
                });

            expect(res.status).toBe(400);
        });

        it('should fail with non-existent user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    name: 'nonexistentuser',
                    password: 'anypassword'
                });

            expect(res.status).toBe(400);
        });

        it('should fail with wrong credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'logintest@example.com',
                    password: 'WrongPassword'
                });

            expect(res.status).toBe(400);
        });
    });
});