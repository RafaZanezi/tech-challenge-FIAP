import request from 'supertest';
import app from '../../../../main/app';
import { authMock } from '../../../auth/presentation/controllers/auth.mock';

describe('Vehicle API Integration Tests', () => {
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

    it('should create, get, update and delete vehicle', async () => {
        const createClientResponse = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'John Doe', identifier: '78517272005' });

        expect(createClientResponse.status).toBe(201);
        expect(createClientResponse.body.data).toHaveProperty('id');

        const clientId = createClientResponse.body.data.id;

        const createResponse = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "brand": "virtual 2",
                "model": "virtual 2",
                "year": "2021",
                "licensePlate": "ABC-8697",
                "clientId": clientId,
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toHaveProperty('id');

        const supplyId = createResponse.body.data.id;

        const getResponse = await request(app)
            .get(`/api/vehicles/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(200);

        const updateResponse = await request(app)
            .put(`/api/vehicles/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                "brand": "update brand",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data.brand).toBe('update brand');

        const deleteResponse = await request(app)
            .delete(`/api/vehicles/${supplyId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);

        // remove o cliente depois de testar o veículo
        const deleteClientResponse = await request(app)
            .delete(`/api/clients/${clientId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteClientResponse.status).toBe(200);
    });
});