import request from 'supertest';
import app from '../../../../main/app';
import { authMock } from '../../../auth/presentation/controllers/auth.mock';

describe('Supply API Integration Tests', () => {
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

    it('should create, get, update and delete supply', async () => {
        const createResponse = await request(app)
            .post('/api/supplies')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "name": "supply creation",
                "quantity": "2",
                "price": "61.40"
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toHaveProperty('id');

        const supplyId = createResponse.body.data.id;

        const getResponse = await request(app)
            .get(`/api/supplies/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(200);

        const updateResponse = await request(app)
            .put(`/api/supplies/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "name": "supply update",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data.name).toBe('supply update');

        const deleteResponse = await request(app)
            .delete(`/api/supplies/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);
    });
});