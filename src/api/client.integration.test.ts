import request from 'supertest';
import express from 'express';
import { TestDatabaseConnection, validCPF, invalidCPF } from '../../test/setup/integration-test-setup';
import { ClientAPI } from './client';

describe('Cliente Integration Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        await testDb.connect();
        
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        const clientAPI = new ClientAPI(testDb);
        app.use('/api', clientAPI.getRoutes());
    });

    beforeEach(async () => {
        await testDb.cleanup();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    describe('POST /api/clients', () => {
        it('deve criar um cliente com dados válidos', async () => {
            const clientData = {
                name: 'João Silva',
                identifier: validCPF
            };

            const response = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(clientData.name);
            expect(response.body.data.identifier).toBe(clientData.identifier);
        });

        it('deve retornar erro ao tentar criar cliente com CPF inválido', async () => {
            const clientData = {
                name: 'João Silva',
                identifier: invalidCPF
            };

            const response = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('inválido');
        });

        it('deve retornar erro ao tentar criar cliente sem nome', async () => {
            const clientData = {
                name: '',
                identifier: validCPF
            };

            const response = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('obrigatório');
        });

        it('deve retornar erro ao tentar criar cliente sem identifier', async () => {
            const clientData = {
                name: 'João Silva',
                identifier: ''
            };

            const response = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('obrigatório');
        });
    });

    describe('GET /api/clients', () => {
        beforeEach(async () => {
            // Criar alguns clientes para teste
            await request(app)
                .post('/api/clients')
                .send({ name: 'João Silva', identifier: validCPF });
            
            await request(app)
                .post('/api/clients')
                .send({ name: 'Maria Santos', identifier: '98765432111' });
        });

        it('deve retornar todos os clientes', async () => {
            const response = await request(app)
                .get('/api/clients')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });

        it('deve retornar um cliente específico por ID', async () => {
            // Primeiro criar um cliente
            const createResponse = await request(app)
                .post('/api/clients')
                .send({ name: 'Pedro Oliveira', identifier: '11122233396' });

            const clientId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(clientId);
            expect(response.body.data.name).toBe('Pedro Oliveira');
        });

        it('deve retornar erro ao buscar cliente inexistente', async () => {
            const response = await request(app)
                .get('/api/clients/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/clients/:id', () => {
        let clientId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/clients')
                .send({ name: 'Cliente Original', identifier: validCPF });
            
            clientId = createResponse.body.data.id;
        });

        it('deve atualizar um cliente existente', async () => {
            const updateData = {
                name: 'Cliente Atualizado'
            };

            const response = await request(app)
                .put(`/api/clients/${clientId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
        });

        it('deve retornar erro ao atualizar cliente inexistente', async () => {
            const updateData = {
                name: 'Cliente Atualizado'
            };

            const response = await request(app)
                .put('/api/clients/999999')
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/clients/:id', () => {
        let clientId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/clients')
                .send({ name: 'Cliente para Deletar', identifier: validCPF });
            
            clientId = createResponse.body.data.id;
        });

        it('deve deletar um cliente existente', async () => {
            const response = await request(app)
                .delete(`/api/clients/${clientId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deletado com sucesso');

            // Verificar se realmente foi deletado
            await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(404);
        });

        it('deve retornar erro ao deletar cliente inexistente', async () => {
            const response = await request(app)
                .delete('/api/clients/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Fluxo completo do cliente', () => {
        it('deve executar o CRUD completo de um cliente', async () => {
            // 1. Criar cliente
            const clientData = {
                name: 'Fluxo Completo',
                identifier: validCPF
            };

            const createResponse = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(201);

            const clientId = createResponse.body.data.id;
            expect(createResponse.body.success).toBe(true);

            // 2. Buscar cliente criado
            const getResponse = await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(200);

            expect(getResponse.body.data.name).toBe(clientData.name);

            // 3. Atualizar cliente
            const updateData = { name: 'Nome Atualizado' };
            const updateResponse = await request(app)
                .put(`/api/clients/${clientId}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.data.name).toBe(updateData.name);

            // 4. Verificar atualização
            const getUpdatedResponse = await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(200);

            expect(getUpdatedResponse.body.data.name).toBe(updateData.name);

            // 5. Deletar cliente
            await request(app)
                .delete(`/api/clients/${clientId}`)
                .expect(200);

            // 6. Verificar que foi deletado
            await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(404);
        });
    });
});
