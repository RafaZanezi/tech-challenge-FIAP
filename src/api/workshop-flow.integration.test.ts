import request from 'supertest';
import express from 'express';
import { TestDatabaseConnection, validCPF } from '../../test/setup/integration-test-setup';
import { ClientAPI } from './client';
import { VehicleAPI } from './vehicle';
import { ServiceAPI } from './service';
import { SupplyAPI } from './supply';

describe('Workshop Integration Flow Tests', () => {
    let app: express.Application;
    let testDb: TestDatabaseConnection;

    beforeAll(async () => {
        testDb = new TestDatabaseConnection();
        await testDb.connect();
        
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        // Configurar todas as APIs
        const clientAPI = new ClientAPI(testDb);
        const vehicleAPI = new VehicleAPI(testDb);
        const serviceAPI = new ServiceAPI(testDb);
        const supplyAPI = new SupplyAPI(testDb);
        
        app.use('/api', clientAPI.getRoutes());
        app.use('/api', vehicleAPI.getRoutes());
        app.use('/api', serviceAPI.getRoutes());
        app.use('/api', supplyAPI.getRoutes());
    });

    beforeEach(async () => {
        await testDb.cleanup();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    describe('Fluxo completo da oficina', () => {
        it('deve simular o fluxo completo: cliente -> veículo -> serviços -> insumos', async () => {
            // 1. CADASTRAR CLIENTE
            const clientData = {
                name: 'João Silva',
                identifier: validCPF
            };

            const clientResponse = await request(app)
                .post('/api/clients')
                .send(clientData)
                .expect(201);

            expect(clientResponse.body.success).toBe(true);
            const clientId = clientResponse.body.data.id;

            // 2. CADASTRAR VEÍCULO DO CLIENTE
            const vehicleData = {
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC1234',
                clientId: clientId
            };

            const vehicleResponse = await request(app)
                .post('/api/vehicles')
                .send(vehicleData)
                .expect(201);

            expect(vehicleResponse.body.success).toBe(true);
            const vehicleId = vehicleResponse.body.data.id;

            // 3. CADASTRAR SERVIÇOS DISPONÍVEIS
            const services = [
                {
                    name: 'Troca de Óleo',
                    description: 'Troca completa do óleo do motor',
                    price: 150.00
                },
                {
                    name: 'Troca de Filtros',
                    description: 'Troca dos filtros de ar, óleo e combustível',
                    price: 120.00
                }
            ];

            const serviceIds = [];
            for (const service of services) {
                const serviceResponse = await request(app)
                    .post('/api/services')
                    .send(service)
                    .expect(201);

                expect(serviceResponse.body.success).toBe(true);
                serviceIds.push(serviceResponse.body.data.id);
            }

            // 4. CADASTRAR INSUMOS NECESSÁRIOS
            const supplies = [
                {
                    name: 'Óleo 5W30',
                    quantity: 20,
                    price: 45.00
                },
                {
                    name: 'Filtro de Óleo',
                    quantity: 30,
                    price: 25.00
                },
                {
                    name: 'Filtro de Ar',
                    quantity: 15,
                    price: 35.00
                },
                {
                    name: 'Filtro de Combustível',
                    quantity: 12,
                    price: 40.00
                }
            ];

            const supplyIds = [];
            for (const supply of supplies) {
                const supplyResponse = await request(app)
                    .post('/api/supplies')
                    .send(supply)
                    .expect(201);

                expect(supplyResponse.body.success).toBe(true);
                supplyIds.push(supplyResponse.body.data.id);
            }

            // 5. VERIFICAR RELACIONAMENTOS
            // Verificar veículos do cliente
            const clientVehiclesResponse = await request(app)
                .get(`/api/vehicles/client/${clientId}`)
                .expect(200);

            expect(clientVehiclesResponse.body.data.length).toBe(1);
            expect(clientVehiclesResponse.body.data[0].id).toBe(vehicleId);

            // 6. SIMULAR CONSUMO DE INSUMOS (atualizar estoque)
            // Simular uso de 1 litro de óleo
            const oilSupplyId = supplyIds[0];
            await request(app)
                .put(`/api/supplies/${oilSupplyId}`)
                .send({ quantity: 19 })
                .expect(200);

            // Simular uso de 1 filtro de óleo
            const oilFilterId = supplyIds[1];
            await request(app)
                .put(`/api/supplies/${oilFilterId}`)
                .send({ quantity: 29 })
                .expect(200);

            // 7. VERIFICAR ESTADO FINAL
            // Verificar se cliente ainda existe
            const finalClientResponse = await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(200);

            expect(finalClientResponse.body.data.name).toBe(clientData.name);

            // Verificar se veículo ainda existe
            const finalVehicleResponse = await request(app)
                .get(`/api/vehicles/${vehicleId}`)
                .expect(200);

            expect(finalVehicleResponse.body.data.licensePlate).toBe(vehicleData.licensePlate);

            // Verificar estoque atualizado
            const finalOilResponse = await request(app)
                .get(`/api/supplies/${oilSupplyId}`)
                .expect(200);

            expect(finalOilResponse.body.data.quantity).toBe(19);

            // Verificar todos os serviços cadastrados
            const allServicesResponse = await request(app)
                .get('/api/services')
                .expect(200);

            expect(allServicesResponse.body.data.length).toBeGreaterThanOrEqual(2);

            // Verificar todos os insumos cadastrados
            const allSuppliesResponse = await request(app)
                .get('/api/supplies')
                .expect(200);

            expect(allSuppliesResponse.body.data.length).toBeGreaterThanOrEqual(4);
        });

        it('deve validar integridade referencial entre cliente e veículo', async () => {
            // 1. Criar cliente
            const clientResponse = await request(app)
                .post('/api/clients')
                .send({
                    name: 'Maria Santos',
                    identifier: validCPF
                })
                .expect(201);

            const clientId = clientResponse.body.data.id;

            // 2. Criar veículo para o cliente
            const vehicleResponse = await request(app)
                .post('/api/vehicles')
                .send({
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'XYZ5678',
                    clientId: clientId
                })
                .expect(201);

            const vehicleId = vehicleResponse.body.data.id;

            // 3. Verificar que o veículo está associado ao cliente correto
            const vehiclesByClientResponse = await request(app)
                .get(`/api/vehicles/client/${clientId}`)
                .expect(200);

            expect(vehiclesByClientResponse.body.data).toHaveLength(1);
            expect(vehiclesByClientResponse.body.data[0].id).toBe(vehicleId);
            expect(vehiclesByClientResponse.body.data[0].clientId).toBe(clientId);

            // 4. Tentar criar veículo com cliente inexistente deve falhar
            await request(app)
                .post('/api/vehicles')
                .send({
                    brand: 'Ford',
                    model: 'Focus',
                    year: 2019,
                    licensePlate: 'INV4LID',
                    clientId: 999999
                })
                .expect(400);
        });

        it('deve gerenciar múltiplos veículos para um cliente', async () => {
            // 1. Criar cliente
            const clientResponse = await request(app)
                .post('/api/clients')
                .send({
                    name: 'Carlos Oliveira',
                    identifier: validCPF
                })
                .expect(201);

            const clientId = clientResponse.body.data.id;

            // 2. Criar múltiplos veículos para o mesmo cliente
            const vehicles = [
                {
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2020,
                    licensePlate: 'CAR1234',
                    clientId: clientId
                },
                {
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'CAR5678',
                    clientId: clientId
                },
                {
                    brand: 'Ford',
                    model: 'Focus',
                    year: 2019,
                    licensePlate: 'CAR9999',
                    clientId: clientId
                }
            ];

            const vehicleIds = [];
            for (const vehicle of vehicles) {
                const vehicleResponse = await request(app)
                    .post('/api/vehicles')
                    .send(vehicle)
                    .expect(201);

                vehicleIds.push(vehicleResponse.body.data.id);
            }

            // 3. Verificar que todos os veículos estão associados ao cliente
            const clientVehiclesResponse = await request(app)
                .get(`/api/vehicles/client/${clientId}`)
                .expect(200);

            expect(clientVehiclesResponse.body.data).toHaveLength(3);
            
            // Verificar que todos os veículos pertencem ao cliente correto
            clientVehiclesResponse.body.data.forEach(vehicle => {
                expect(vehicle.clientId).toBe(clientId);
                expect(vehicleIds).toContain(vehicle.id);
            });
        });

        it('deve simular um cenário de oficina com controle de estoque', async () => {
            // 1. Setup inicial - cadastrar insumos
            const initialSupplies = [
                { name: 'Óleo Motor', quantity: 50, price: 40.00 },
                { name: 'Filtro Óleo', quantity: 100, price: 20.00 },
                { name: 'Pastilha Freio', quantity: 20, price: 150.00 }
            ];

            const supplyIds = [];
            for (const supply of initialSupplies) {
                const response = await request(app)
                    .post('/api/supplies')
                    .send(supply)
                    .expect(201);
                supplyIds.push(response.body.data.id);
            }

            // 2. Simular serviços que consomem insumos
            // Troca de óleo consome: 4L de óleo + 1 filtro
            await request(app)
                .put(`/api/supplies/${supplyIds[0]}`) // Óleo
                .send({ quantity: 46 }) // 50 - 4 = 46
                .expect(200);

            await request(app)
                .put(`/api/supplies/${supplyIds[1]}`) // Filtro
                .send({ quantity: 99 }) // 100 - 1 = 99
                .expect(200);

            // 3. Verificar estoque atualizado
            const oilResponse = await request(app)
                .get(`/api/supplies/${supplyIds[0]}`)
                .expect(200);
            expect(oilResponse.body.data.quantity).toBe(46);

            const filterResponse = await request(app)
                .get(`/api/supplies/${supplyIds[1]}`)
                .expect(200);
            expect(filterResponse.body.data.quantity).toBe(99);

            // 4. Simular reposição de estoque
            await request(app)
                .put(`/api/supplies/${supplyIds[0]}`)
                .send({ quantity: 60 }) // Reposição de óleo
                .expect(200);

            // 5. Verificar reposição
            const restockedOilResponse = await request(app)
                .get(`/api/supplies/${supplyIds[0]}`)
                .expect(200);
            expect(restockedOilResponse.body.data.quantity).toBe(60);
        });
    });

    describe('Cenários de erro e validação', () => {
        it('deve falhar ao tentar criar veículo para cliente inexistente', async () => {
            const vehicleData = {
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                licensePlate: 'ABC1234',
                clientId: 999999 // Cliente inexistente
            };

            await request(app)
                .post('/api/vehicles')
                .send(vehicleData)
                .expect(400);
        });

        it('deve manter consistência após falhas parciais', async () => {
            // 1. Criar cliente com sucesso
            const clientResponse = await request(app)
                .post('/api/clients')
                .send({
                    name: 'Teste Consistência',
                    identifier: validCPF
                })
                .expect(201);

            const clientId = clientResponse.body.data.id;

            // 2. Tentar criar veículo com dados inválidos
            await request(app)
                .post('/api/vehicles')
                .send({
                    brand: '', // Inválido
                    model: 'Modelo',
                    year: 2020,
                    licensePlate: 'ABC1234',
                    clientId: clientId
                })
                .expect(400);

            // 3. Verificar que cliente ainda existe
            const clientStillExistsResponse = await request(app)
                .get(`/api/clients/${clientId}`)
                .expect(200);

            expect(clientStillExistsResponse.body.data.name).toBe('Teste Consistência');

            // 4. Criar veículo válido deve funcionar
            await request(app)
                .post('/api/vehicles')
                .send({
                    brand: 'Marca Válida',
                    model: 'Modelo Válido',
                    year: 2020,
                    licensePlate: 'ABC1234',
                    clientId: clientId
                })
                .expect(201);
        });
    });
});
