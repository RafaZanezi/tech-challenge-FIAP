import request from 'supertest';
import app from '../../../../main/app';
import { authMock } from '../../../auth/presentation/controllers/auth.mock';

describe('Service API Integration Tests', () => {
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

    it('should create, get, update and delete service', async () => {
        const createResponse = await request(app)
            .post('/api/services')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "name": "service creation",
                "description": "service test",
                "price": "0.80"
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toHaveProperty('id');

        const serviceId = createResponse.body.data.id;

        const getResponse = await request(app)
            .get(`/api/services/${serviceId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(200);

        const updateResponse = await request(app)
            .put(`/api/services/${serviceId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "name": "service update",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data.name).toBe('service update');

        const deleteResponse = await request(app)
            .delete(`/api/services/${serviceId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);
    });
});