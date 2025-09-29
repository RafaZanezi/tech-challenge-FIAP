import request from 'supertest';
import express from 'express';
import { TestDatabaseConnection } from '../../test/setup/integration-test-setup';
import { SupplyAPI } from './supply';
import { AuthAPI } from './auth';

describe('Supply Integration Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;
    let authToken: string;

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        await testDb.connect();
        
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        const authAPI = new AuthAPI(testDb);
        const supplyAPI = new SupplyAPI(testDb);
        app.use('/api', authAPI.getRoutes());
        app.use('/api', supplyAPI.getRoutes());
        
        // Add error handling middleware
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    message: err.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        });
        
        // Create admin user and get token
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'TestAdmin',
                password: 'password123',
                role: 'admin'
            });
        
        authToken = registerResponse.body.data.token;
    });

    beforeEach(async () => {
        await testDb.cleanup();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    describe('POST /api/supplies', () => {
        it('deve criar um insumo com dados válidos', async () => {
            const supplyData = {
                name: 'Óleo 5W30',
                quantity: 10,
                price: 45.00
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(supplyData.name);
            expect(response.body.data.quantity).toBe(supplyData.quantity);
            expect(response.body.data.price).toBe(supplyData.price);
        });

        it('deve criar um insumo com quantidade zero', async () => {
            const supplyData = {
                name: 'Filtro de Ar',
                quantity: 0,
                price: 25.00
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.quantity).toBe(0);
        });

        it('deve criar um insumo com preço zero', async () => {
            const supplyData = {
                name: 'Insumo Gratuito',
                quantity: 5,
                price: 0
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.price).toBe(0);
        });

        it('deve retornar erro ao tentar criar insumo sem nome', async () => {
            const supplyData = {
                name: '',
                quantity: 10,
                price: 45.00
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Nome');
        });

        it('deve retornar erro ao tentar criar insumo com quantidade negativa', async () => {
            const supplyData = {
                name: 'Óleo 5W30',
                quantity: -5,
                price: 45.00
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Quantidade');
        });

        it('deve retornar erro ao tentar criar insumo com preço negativo', async () => {
            const supplyData = {
                name: 'Óleo 5W30',
                quantity: 10,
                price: -45.00
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Preço');
        });
    });

    describe('GET /api/supplies', () => {
        beforeEach(async () => {
            // Criar alguns insumos para teste
            await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Óleo 5W30',
                    quantity: 10,
                    price: 45.00
                });
            
            await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Filtro de Óleo',
                    quantity: 25,
                    price: 18.50
                });
        });

        it('deve retornar todos os insumos', async () => {
            const response = await request(app)
                .get('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('deve retornar um insumo específico por ID', async () => {
            // Primeiro criar um insumo
            const createResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Pastilha de Freio',
                    quantity: 8,
                    price: 120.00
                });

            const supplyId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(supplyId);
            expect(response.body.data.name).toBe('Pastilha de Freio');
        });

        it('deve retornar erro ao buscar insumo inexistente', async () => {
            const response = await request(app)
                .get('/api/supplies/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/supplies/:id', () => {
        let supplyId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Insumo Original',
                    quantity: 5,
                    price: 30.00
                });
            
            supplyId = createResponse.body.data.id;
        });

        it('deve atualizar um insumo existente', async () => {
            const updateData = {
                name: 'Insumo Atualizado',
                quantity: 15,
                price: 50.00
            };

            const response = await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.quantity).toBe(updateData.quantity);
            expect(response.body.data.price).toBe(updateData.price);
        });

        it('deve atualizar apenas campos específicos', async () => {
            const updateData = {
                quantity: 20
            };

            const response = await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.quantity).toBe(updateData.quantity);
            expect(response.body.data.name).toBe('Insumo Original'); // Não deve ter mudado
        });

        it('deve permitir reduzir quantidade para zero', async () => {
            const updateData = {
                quantity: 0
            };

            const response = await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.quantity).toBe(0);
        });

        it('deve retornar erro ao atualizar insumo inexistente', async () => {
            const updateData = {
                name: 'Insumo Atualizado'
            };

            const response = await request(app)
                .put('/api/supplies/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/supplies/:id', () => {
        let supplyId: number;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Insumo para Deletar',
                    quantity: 3,
                    price: 25.00
                });
            
            supplyId = createResponse.body.data.id;
        });

        it('deve deletar um insumo existente', async () => {
            const response = await request(app)
                .delete(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deletado com sucesso');

            // Verificar se realmente foi deletado
            await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('deve retornar erro ao deletar insumo inexistente', async () => {
            const response = await request(app)
                .delete('/api/supplies/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Validações de negócio', () => {
        it('deve aceitar diferentes tipos de insumos automotivos', async () => {
            const supplies = [
                {
                    name: 'Óleo de Motor 10W40',
                    quantity: 15,
                    price: 38.90
                },
                {
                    name: 'Pneu 185/60R15',
                    quantity: 4,
                    price: 285.00
                },
                {
                    name: 'Bateria 60Ah',
                    quantity: 2,
                    price: 320.50
                },
                {
                    name: 'Vela de Ignição',
                    quantity: 50,
                    price: 12.75
                }
            ];

            for (const supply of supplies) {
                const response = await request(app)
                    .post('/api/supplies')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(supply)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe(supply.name);
                expect(response.body.data.quantity).toBe(supply.quantity);
                expect(response.body.data.price).toBe(supply.price);
            }
        });

        it('deve permitir preços e quantidades decimais', async () => {
            const supplyData = {
                name: 'Insumo com preço decimal',
                quantity: 3, // Quantidade deve ser inteira
                price: 99.99
            };

            const response = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.quantity).toBe(3);
            expect(response.body.data.price).toBe(99.99);
        });

        it('deve gerenciar estoque corretamente', async () => {
            // Criar insumo com estoque
            const createResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Insumo Estoque',
                    quantity: 100,
                    price: 50.00
                });

            const supplyId = createResponse.body.data.id;

            // Simular consumo de estoque
            await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 75 })
                .expect(200);

            // Verificar se estoque foi atualizado
            const getResponse = await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(getResponse.body.data.quantity).toBe(75);

            // Zerar estoque
            await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 0 })
                .expect(200);

            // Verificar se estoque foi zerado
            const getFinalResponse = await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(getFinalResponse.body.data.quantity).toBe(0);
        });
    });

    describe('Fluxo completo do insumo', () => {
        it('deve executar o CRUD completo de um insumo', async () => {
            // 1. Criar insumo
            const supplyData = {
                name: 'Fluxo Completo',
                quantity: 50,
                price: 75.25
            };

            const createResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supplyData)
                .expect(201);

            const supplyId = createResponse.body.data.id;
            expect(createResponse.body.success).toBe(true);

            // 2. Buscar insumo criado
            const getResponse = await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(getResponse.body.data.name).toBe(supplyData.name);
            expect(getResponse.body.data.quantity).toBe(supplyData.quantity);
            expect(getResponse.body.data.price).toBe(supplyData.price);

            // 3. Atualizar insumo
            const updateData = {
                name: 'Nome Atualizado',
                quantity: 25,
                price: 100.00
            };
            
            const updateResponse = await request(app)
                .put(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.data.name).toBe(updateData.name);
            expect(updateResponse.body.data.quantity).toBe(updateData.quantity);
            expect(updateResponse.body.data.price).toBe(updateData.price);

            // 4. Verificar atualização
            const getUpdatedResponse = await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(getUpdatedResponse.body.data.name).toBe(updateData.name);
            expect(getUpdatedResponse.body.data.quantity).toBe(updateData.quantity);

            // 5. Deletar insumo
            await request(app)
                .delete(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // 6. Verificar que foi deletado
            await request(app)
                .get(`/api/supplies/${supplyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});
