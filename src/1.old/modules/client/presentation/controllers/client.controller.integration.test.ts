import request from 'supertest';
import app from '../../../../main/app';
import { authMock } from '../../../auth/presentation/controllers/auth.mock';

describe('Client API Integration Tests', () => {
    let authToken: string;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                name: authMock.user,
                password: authMock.password
            });
        authToken = loginResponse.body.data.token;
    });

    it('should create, get, update and delete client', async () => {
        const createResponse = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'John Doe', identifier: '63161580095' });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toHaveProperty('id');

        const clientId = createResponse.body.data.id;

        const getResponse = await request(app)
            .get(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(200);

        const updateResponse = await request(app)
            .put(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Name' });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data.name).toBe('Updated Name');

        const deleteResponse = await request(app)
            .delete(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);
    });
});