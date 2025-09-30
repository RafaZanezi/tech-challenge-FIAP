import request from 'supertest';
import express from 'express';
import { TestDatabaseConnection, validCPF } from '../../test/setup/integration-test-setup';

// Second valid CPF for testing (calculated valid CPF)
const validCPF2 = '52998224725';
import { ServiceOrderAPI } from './service-order';
import { ClientAPI } from './client';
import { VehicleAPI } from './vehicle';
import { ServiceAPI } from './service';
import { SupplyAPI } from './supply';
import { AuthAPI } from './auth';

describe('Service Order API Integration Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;
    let authToken: string;
    let clientId: number;
    let vehicleId: number;
    let serviceIds: number[];
    let supplyIds: number[];

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        await testDb.connect();
        
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        // Configurar todas as APIs necessárias
        const authAPI = new AuthAPI(testDb);
        const clientAPI = new ClientAPI(testDb);
        const vehicleAPI = new VehicleAPI(testDb);
        const serviceAPI = new ServiceAPI(testDb);
        const supplyAPI = new SupplyAPI(testDb);
        const serviceOrderAPI = new ServiceOrderAPI(testDb);
        
        app.use('/api', authAPI.getRoutes());
        app.use('/api', clientAPI.getRoutes());
        app.use('/api', vehicleAPI.getRoutes());
        app.use('/api', serviceAPI.getRoutes());
        app.use('/api', supplyAPI.getRoutes());
        app.use('/api', serviceOrderAPI.getRoutes());
        
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
        
        // Setup básico para cada teste: cliente, veículo, serviços e suprimentos
        // 1. Criar cliente
        const clientResponse = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'João Silva',
                identifier: validCPF
            });
        clientId = clientResponse.body.data.id;

        // 2. Criar veículo
        const vehicleResponse = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC1234',
                clientId: clientId
            });
        vehicleId = vehicleResponse.body.data.id;

        // 3. Criar serviços
        const services = [
            { name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 },
            { name: 'Alinhamento', description: 'Alinhamento e balanceamento', price: 120.00 }
        ];

        serviceIds = [];
        for (const service of services) {
            const serviceResponse = await request(app)
                .post('/api/services')
                .set('Authorization', `Bearer ${authToken}`)
                .send(service);
            serviceIds.push(serviceResponse.body.data.id);
        }

        // 4. Criar suprimentos
        const supplies = [
            { name: 'Óleo 5W30', quantity: 20, price: 45.00 },
            { name: 'Filtro de Óleo', quantity: 30, price: 25.00 }
        ];

        supplyIds = [];
        for (const supply of supplies) {
            const supplyResponse = await request(app)
                .post('/api/supplies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(supply);
            supplyIds.push(supplyResponse.body.data.id);
        }
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    describe('POST /api/service-orders - Abertura de Ordem de Serviço', () => {
        it('deve criar uma nova ordem de serviço com sucesso', async () => {
            const serviceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ],
                supplies: [
                    { id: supplyIds[0], name: 'Óleo 5W30', quantity: 20, price: 45.00 }
                ]
            };

            const response = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.clientId).toBe(clientId);
            expect(response.body.data.vehicleId).toBe(vehicleId);
            expect(response.body.data.status).toBe('RECEIVED');
            expect(response.body.data.services).toHaveLength(1);
            expect(response.body.data.supplies).toHaveLength(1);
        });

        it('deve retornar erro ao tentar criar OS para cliente inexistente', async () => {
            const serviceOrderData = {
                clientId: 999999,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ]
            };

            await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData)
                .expect(400);
        });

        it('deve retornar erro ao tentar criar OS duplicada para mesmo cliente e veículo', async () => {
            const serviceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ]
            };

            // Primeira OS - deve criar com sucesso
            await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData)
                .expect(201);

            // Segunda OS para mesmo cliente/veículo - deve falhar
            await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData)
                .expect(409);
        });
    });

    describe('GET /api/service-orders/:id/status - Consulta de Status da OS', () => {
        it('deve retornar o status da ordem de serviço', async () => {
            // Criar OS
            const serviceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ]
            };

            const createResponse = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData);

            const serviceOrderId = createResponse.body.data.id;

            // Consultar status
            const statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(statusResponse.body.id).toBe(serviceOrderId);
            expect(statusResponse.body.status).toBe('RECEIVED');
        });

        it('deve retornar erro para OS inexistente', async () => {
            await request(app)
                .get('/api/service-orders/999999/status')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('POST /api/service-orders/:id/external-approval - Aprovação de Orçamento', () => {
        let serviceOrderId: number;

        beforeEach(async () => {
            // Criar uma OS e colocá-la em estado de aguardando aprovação
            const serviceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ]
            };

            const createResponse = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData);

            serviceOrderId = createResponse.body.data.id;

            // Mover para diagnóstico
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/start-diagnosis`)
                .set('Authorization', `Bearer ${authToken}`);

            // Submeter para aprovação
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/submit-approval`)
                .set('Authorization', `Bearer ${authToken}`);
        });

        it('deve aprovar o orçamento quando approved=true', async () => {
            const response = await request(app)
                .post(`/api/service-orders/${serviceOrderId}/external-approval`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ approved: true })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('APPROVED');
        });

        it('deve rejeitar o orçamento quando approved=false', async () => {
            const response = await request(app)
                .post(`/api/service-orders/${serviceOrderId}/external-approval`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ approved: false })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('CANCELLED');
        });

        it('deve retornar erro quando approved não é boolean', async () => {
            await request(app)
                .post(`/api/service-orders/${serviceOrderId}/external-approval`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ approved: 'sim' })
                .expect(400);
        });

        it('deve retornar erro para OS inexistente', async () => {
            await request(app)
                .post('/api/service-orders/999999/external-approval')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ approved: true })
                .expect(404);
        });
    });

    describe('GET /api/service-orders-active - Listagem de Ordens de Serviço', () => {
        beforeEach(async () => {
            // Criar múltiplas OS em diferentes estados
            const baseServiceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ]
            };

            // OS 1: RECEIVED (mais antiga)
            const os1Response = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(baseServiceOrderData);
            
            // Aguardar um pouco para garantir diferença de timestamp
            await new Promise(resolve => setTimeout(resolve, 100));

            // Criar novo cliente e veículo para evitar conflito
            const client2Response = await request(app)
                .post('/api/clients')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Maria Santos',
                    identifier: validCPF2
                })
                .expect(201);

            expect(client2Response.body.data).toBeDefined();
            expect(client2Response.body.data.id).toBeDefined();

            const vehicle2Response = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'XYZ5678',
                    clientId: client2Response.body.data.id
                })
                .expect(201);

            // OS 2: IN_PROGRESS (deve aparecer primeiro na lista)
            const os2Response = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...baseServiceOrderData,
                    clientId: client2Response.body.data.id,
                    vehicleId: vehicle2Response.body.data.id
                });

            const os2Id = os2Response.body.data.id;

            // Mover OS2 para IN_PROGRESS
            await request(app)
                .patch(`/api/service-orders/${os2Id}/start-diagnosis`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os2Id}/submit-approval`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os2Id}/approve`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os2Id}/start-execution`)
                .set('Authorization', `Bearer ${authToken}`);

            // Criar mais um cliente e veículo
            const client3Response = await request(app)
                .post('/api/clients')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Carlos Oliveira',
                    identifier: '98765432100'
                });

            const vehicle3Response = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    brand: 'Ford',
                    model: 'Focus',
                    year: 2019,
                    licensePlate: 'FOC9999',
                    clientId: client3Response.body.data.id
                });

            // OS 3: FINISHED (não deve aparecer na lista)
            const os3Response = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...baseServiceOrderData,
                    clientId: client3Response.body.data.id,
                    vehicleId: vehicle3Response.body.data.id
                });

            const os3Id = os3Response.body.data.id;

            // Mover OS3 para FINISHED
            await request(app)
                .patch(`/api/service-orders/${os3Id}/start-diagnosis`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os3Id}/submit-approval`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os3Id}/approve`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os3Id}/start-execution`)
                .set('Authorization', `Bearer ${authToken}`);
            
            await request(app)
                .patch(`/api/service-orders/${os3Id}/finalize`)
                .set('Authorization', `Bearer ${authToken}`);
        });

        it('deve listar apenas OS ativas com ordenação correta', async () => {
            const response = await request(app)
                .get('/api/service-orders-active')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2); // Apenas as OS ativas

            // Verificar ordenação: IN_PROGRESS deve vir primeiro
            expect(response.body.data[0].status).toBe('IN_PROGRESS');
            expect(response.body.data[1].status).toBe('RECEIVED');

            // Verificar que FINISHED não está na lista
            const statuses = response.body.data.map(os => os.status);
            expect(statuses).not.toContain('FINISHED');
            expect(statuses).not.toContain('DELIVERED');
        });
    });

    describe('Fluxo completo da Ordem de Serviço', () => {
        it('deve executar o fluxo completo de uma OS', async () => {
            // 1. Criar OS
            const serviceOrderData = {
                clientId: clientId,
                vehicleId: vehicleId,
                services: [
                    { id: serviceIds[0], name: 'Troca de Óleo', description: 'Troca completa do óleo', price: 150.00 }
                ],
                supplies: [
                    { id: supplyIds[0], name: 'Óleo 5W30', quantity: 20, price: 45.00 }
                ]
            };

            const createResponse = await request(app)
                .post('/api/service-orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(serviceOrderData)
                .expect(201);

            const serviceOrderId = createResponse.body.data.id;

            // 2. Verificar status inicial
            let statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(statusResponse.body.status).toBe('RECEIVED');

            // 3. Iniciar diagnóstico
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/start-diagnosis`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('IN_DIAGNOSIS');

            // 4. Submeter para aprovação
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/submit-approval`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('WAITING_FOR_APPROVAL');

            // 5. Aprovar externamente
            await request(app)
                .post(`/api/service-orders/${serviceOrderId}/external-approval`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ approved: true })
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('APPROVED');

            // 6. Iniciar execução
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/start-execution`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('IN_PROGRESS');

            // 7. Finalizar
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/finalize`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('FINISHED');

            // 8. Entregar
            await request(app)
                .patch(`/api/service-orders/${serviceOrderId}/deliver`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            statusResponse = await request(app)
                .get(`/api/service-orders/${serviceOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(statusResponse.body.status).toBe('DELIVERED');

            // 9. Verificar que não aparece mais na lista ativa
            const activeListResponse = await request(app)
                .get('/api/service-orders-active')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const activeIds = activeListResponse.body.data.map(os => os.id);
            expect(activeIds).not.toContain(serviceOrderId);
        });
    });
});