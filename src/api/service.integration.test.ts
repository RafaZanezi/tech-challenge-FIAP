import request from 'supertest';
import express from 'express';
import { TestDatabaseConnection } from '../../test/setup/integration-test-setup';
import { ServiceAPI } from './service';

describe('Service Integration Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        await testDb.connect();
        
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        const serviceAPI = new ServiceAPI(testDb);
        app.use('/api', serviceAPI.getRoutes());
    });

    beforeEach(async () => {
        await testDb.cleanup();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    describe('POST /api/services', () => {
        it('deve criar um serviço com dados válidos', async () => {
            const serviceData = {
                name: 'Troca de Óleo',
                description: 'Troca completa do óleo do motor',
                price: 150.00
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(serviceData.name);
            expect(response.body.data.description).toBe(serviceData.description);
            expect(response.body.data.price).toBe(serviceData.price);
        });

        it('deve retornar erro ao tentar criar serviço sem nome', async () => {
            const serviceData = {
                name: '',
                description: 'Descrição do serviço',
                price: 100.00
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Nome');
        });

        it('deve retornar erro ao tentar criar serviço sem descrição', async () => {
            const serviceData = {
                name: 'Nome do Serviço',
                description: '',
                price: 100.00
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Descrição');
        });

        it('deve retornar erro ao tentar criar serviço com preço inválido', async () => {
            const serviceData = {
                name: 'Nome do Serviço',
                description: 'Descrição do serviço',
                price: 0
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Preço');
        });

        it('deve retornar erro ao tentar criar serviço com preço negativo', async () => {
            const serviceData = {
                name: 'Nome do Serviço',
                description: 'Descrição do serviço',
                price: -50.00
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Preço');
        });
    });

    describe('GET /api/services', () => {
        beforeEach(async () => {
            // Criar alguns serviços para teste
            await request(app)
                .post('/api/services')
                .send({
                    name: 'Troca de Óleo',
                    description: 'Troca completa do óleo do motor',
                    price: 150.00
                });
            
            await request(app)
                .post('/api/services')
                .send({
                    name: 'Alinhamento',
                    description: 'Alinhamento e balanceamento das rodas',
                    price: 80.00
                });
        });

        it('deve retornar todos os serviços', async () => {
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('deve retornar um serviço específico por ID', async () => {
            // Primeiro criar um serviço
            const createResponse = await request(app)
                .post('/api/services')
                .send({
                    name: 'Lavagem Completa',
                    description: 'Lavagem externa e interna do veículo',
                    price: 45.00
                });

            const serviceId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(serviceId);
            expect(response.body.data.name).toBe('Lavagem Completa');
        });

        it('deve retornar erro ao buscar serviço inexistente', async () => {
            const response = await request(app)
                .get('/api/services/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/services/:id', () => {
        let serviceId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/services')
                .send({
                    name: 'Serviço Original',
                    description: 'Descrição original',
                    price: 100.00
                });
            
            serviceId = createResponse.body.data.id;
        });

        it('deve atualizar um serviço existente', async () => {
            const updateData = {
                name: 'Serviço Atualizado',
                description: 'Descrição atualizada',
                price: 200.00
            };

            const response = await request(app)
                .put(`/api/services/${serviceId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.description).toBe(updateData.description);
            expect(response.body.data.price).toBe(updateData.price);
        });

        it('deve atualizar apenas campos específicos', async () => {
            const updateData = {
                price: 250.00
            };

            const response = await request(app)
                .put(`/api/services/${serviceId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.price).toBe(updateData.price);
            expect(response.body.data.name).toBe('Serviço Original'); // Não deve ter mudado
        });

        it('deve retornar erro ao atualizar serviço inexistente', async () => {
            const updateData = {
                name: 'Serviço Atualizado'
            };

            const response = await request(app)
                .put('/api/services/999999')
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/services/:id', () => {
        let serviceId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/services')
                .send({
                    name: 'Serviço para Deletar',
                    description: 'Descrição para teste',
                    price: 75.00
                });
            
            serviceId = createResponse.body.data.id;
        });

        it('deve deletar um serviço existente', async () => {
            const response = await request(app)
                .delete(`/api/services/${serviceId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deletado com sucesso');

            // Verificar se realmente foi deletado
            await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(404);
        });

        it('deve retornar erro ao deletar serviço inexistente', async () => {
            const response = await request(app)
                .delete('/api/services/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Validações de negócio', () => {
        it('deve aceitar diferentes tipos de serviços automotivos', async () => {
            const services = [
                {
                    name: 'Troca de Pastilhas de Freio',
                    description: 'Substituição das pastilhas de freio dianteiras e traseiras',
                    price: 250.00
                },
                {
                    name: 'Revisão Geral',
                    description: 'Revisão completa de todos os sistemas do veículo',
                    price: 500.00
                },
                {
                    name: 'Instalação de Som',
                    description: 'Instalação e configuração de sistema de som automotivo',
                    price: 300.00
                }
            ];

            for (const service of services) {
                const response = await request(app)
                    .post('/api/services')
                    .send(service)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe(service.name);
            }
        });

        it('deve permitir preços decimais', async () => {
            const serviceData = {
                name: 'Serviço com preço decimal',
                description: 'Teste para preços com centavos',
                price: 99.99
            };

            const response = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.price).toBe(99.99);
        });
    });

    describe('Fluxo completo do serviço', () => {
        it('deve executar o CRUD completo de um serviço', async () => {
            // 1. Criar serviço
            const serviceData = {
                name: 'Fluxo Completo',
                description: 'Teste de fluxo completo',
                price: 175.50
            };

            const createResponse = await request(app)
                .post('/api/services')
                .send(serviceData)
                .expect(201);

            const serviceId = createResponse.body.data.id;
            expect(createResponse.body.success).toBe(true);

            // 2. Buscar serviço criado
            const getResponse = await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(200);

            expect(getResponse.body.data.name).toBe(serviceData.name);
            expect(getResponse.body.data.price).toBe(serviceData.price);

            // 3. Atualizar serviço
            const updateData = {
                name: 'Nome Atualizado',
                description: 'Descrição atualizada',
                price: 200.00
            };
            
            const updateResponse = await request(app)
                .put(`/api/services/${serviceId}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.data.name).toBe(updateData.name);
            expect(updateResponse.body.data.price).toBe(updateData.price);

            // 4. Verificar atualização
            const getUpdatedResponse = await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(200);

            expect(getUpdatedResponse.body.data.name).toBe(updateData.name);

            // 5. Deletar serviço
            await request(app)
                .delete(`/api/services/${serviceId}`)
                .expect(200);

            // 6. Verificar que foi deletado
            await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(404);
        });
    });
});
