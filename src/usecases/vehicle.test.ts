import { VehicleUseCases } from './vehicle';
import { Vehicle } from '../entities/vehicle';
import { VehicleGatewayInterface, ClientGatewayInterface } from '../interfaces/gateways';
import { ConflictError, ValidationError } from './errors/errors';
import { NotFoundHttpError } from '../api/errors/http-errors';

describe('VehicleUseCases', () => {
    let vehicleUseCases: VehicleUseCases;
    let mockVehicleGateway: jest.Mocked<VehicleGatewayInterface>;
    let mockClientGateway: jest.Mocked<ClientGatewayInterface>;

    beforeEach(() => {
        mockVehicleGateway = {
            insert: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findByLicensePlate: jest.fn(),
            findByClientId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        mockClientGateway = {
            insert: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findByIdentifier: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        vehicleUseCases = new VehicleUseCases(mockVehicleGateway, mockClientGateway);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createVehicle', () => {
        it('should create a new vehicle successfully', async () => {
            const vehicleData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            const mockSavedVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            const mockClient = {
                id: 1,
                name: 'João Silva',
                identifier: '12345678901'
            };

            mockVehicleGateway.findByLicensePlate.mockResolvedValue(null);
            mockClientGateway.findById.mockResolvedValue(mockClient);
            mockVehicleGateway.insert.mockResolvedValue(mockSavedVehicle);

            const result = await vehicleUseCases.createVehicle(vehicleData);

            expect(mockVehicleGateway.findByLicensePlate).toHaveBeenCalledWith('ABC-1234');
            expect(mockClientGateway.findById).toHaveBeenCalledWith(1);
            expect(mockVehicleGateway.insert).toHaveBeenCalledWith(vehicleData);
            expect(result).toBeInstanceOf(Vehicle);
            expect(result.licensePlate).toBe('ABC-1234');
            expect(result.id).toBe(1);
        });

        it('should throw ConflictError if vehicle with same license plate exists', async () => {
            const vehicleData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            const existingVehicle = {
                id: 2,
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'ABC-1234',
                clientId: 2
            };

            mockVehicleGateway.findByLicensePlate.mockResolvedValue(existingVehicle);

            await expect(
                vehicleUseCases.createVehicle(vehicleData)
            ).rejects.toThrow(ConflictError);
            await expect(
                vehicleUseCases.createVehicle(vehicleData)
            ).rejects.toThrow('Veículo com esta placa já existe');
        });

        it('should throw ValidationError if client does not exist', async () => {
            const vehicleData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 999
            });

            mockVehicleGateway.findByLicensePlate.mockResolvedValue(null);
            mockClientGateway.findById.mockResolvedValue(null);

            await expect(
                vehicleUseCases.createVehicle(vehicleData)
            ).rejects.toThrow(ValidationError);
            await expect(
                vehicleUseCases.createVehicle(vehicleData)
            ).rejects.toThrow('Cliente não encontrado');
        });
    });

    describe('findVehicleById', () => {
        it('should return vehicle by id', async () => {
            const mockVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            mockVehicleGateway.findById.mockResolvedValue(mockVehicle);

            const result = await vehicleUseCases.findVehicleById(1);

            expect(mockVehicleGateway.findById).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(Vehicle);
            expect(result?.id).toBe(1);
            expect(result?.licensePlate).toBe('ABC-1234');
        });

        it('should throw NotFoundHttpError if vehicle not found', async () => {
            mockVehicleGateway.findById.mockResolvedValue(null);

            await expect(
                vehicleUseCases.findVehicleById(999)
            ).rejects.toThrow(NotFoundHttpError);
            await expect(
                vehicleUseCases.findVehicleById(999)
            ).rejects.toThrow('Veículo');
        });
    });

    describe('findAllVehicles', () => {
        it('should return all vehicles', async () => {
            const mockVehicles = [
                {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2022,
                    licensePlate: 'ABC-1234',
                    clientId: 1
                },
                {
                    id: 2,
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'DEF-5678',
                    clientId: 2
                }
            ];

            mockVehicleGateway.findAll.mockResolvedValue(mockVehicles);

            const result = await vehicleUseCases.findAllVehicles();

            expect(mockVehicleGateway.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Vehicle);
            expect(result[1]).toBeInstanceOf(Vehicle);
        });

        it('should return empty array when no vehicles found', async () => {
            mockVehicleGateway.findAll.mockResolvedValue([]);

            const result = await vehicleUseCases.findAllVehicles();

            expect(result).toEqual([]);
        });
    });

    describe('findVehiclesByClientId', () => {
        it('should return vehicles for specific client', async () => {
            const mockVehicles = [
                {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2022,
                    licensePlate: 'ABC-1234',
                    clientId: 1
                }
            ];

            mockVehicleGateway.findByClientId.mockResolvedValue(mockVehicles);

            const result = await vehicleUseCases.findVehiclesByClientId(1);

            expect(mockVehicleGateway.findByClientId).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(Vehicle);
            expect(result[0].clientId).toBe(1);
        });
    });

    describe('updateVehicle', () => {
        it('should update vehicle successfully', async () => {
            const existingVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            const updateData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla XEI',
                year: 2023,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            const updatedVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla XEI',
                year: 2023,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            mockVehicleGateway.findById.mockResolvedValue(existingVehicle);
            mockVehicleGateway.findByLicensePlate.mockResolvedValue(existingVehicle);
            mockVehicleGateway.update.mockResolvedValue(updatedVehicle);

            const result = await vehicleUseCases.updateVehicle(1, updateData);

            expect(mockVehicleGateway.findById).toHaveBeenCalledWith(1);
            expect(mockVehicleGateway.update).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Vehicle);
            expect(result.model).toBe('Corolla XEI');
            expect(result.year).toBe(2023);
        });

        it('should throw NotFoundHttpError if vehicle not found', async () => {
            const updateData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            });

            mockVehicleGateway.findById.mockResolvedValue(null);

            await expect(
                vehicleUseCases.updateVehicle(999, updateData)
            ).rejects.toThrow(NotFoundHttpError);
            await expect(
                vehicleUseCases.updateVehicle(999, updateData)
            ).rejects.toThrow('Veículo');
        });

        it('should throw ConflictError if license plate is already used by another vehicle', async () => {
            const existingVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            const anotherVehicle = {
                id: 2,
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'DEF-5678',
                clientId: 2
            };

            const updateData = new Vehicle({
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'DEF-5678', // placa já existente
                clientId: 1
            });

            mockVehicleGateway.findById.mockResolvedValue(existingVehicle);
            mockVehicleGateway.findByLicensePlate.mockResolvedValue(anotherVehicle);

            await expect(
                vehicleUseCases.updateVehicle(1, updateData)
            ).rejects.toThrow(ConflictError);
            await expect(
                vehicleUseCases.updateVehicle(1, updateData)
            ).rejects.toThrow('Veículo com esta placa já existe');
        });
    });

    describe('deleteVehicle', () => {
        it('should delete vehicle successfully', async () => {
            const existingVehicle = {
                id: 1,
                brand: 'Toyota',
                model: 'Corolla',
                year: 2022,
                licensePlate: 'ABC-1234',
                clientId: 1
            };

            mockVehicleGateway.findById.mockResolvedValue(existingVehicle);
            mockVehicleGateway.delete.mockResolvedValue(undefined);

            await vehicleUseCases.deleteVehicle(1);

            expect(mockVehicleGateway.findById).toHaveBeenCalledWith(1);
            expect(mockVehicleGateway.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundHttpError if vehicle not found', async () => {
            mockVehicleGateway.findById.mockResolvedValue(null);

            await expect(
                vehicleUseCases.deleteVehicle(999)
            ).rejects.toThrow(NotFoundHttpError);
            await expect(
                vehicleUseCases.deleteVehicle(999)
            ).rejects.toThrow('Veículo');

            expect(mockVehicleGateway.delete).not.toHaveBeenCalled();
        });
    });
});