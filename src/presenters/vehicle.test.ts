import { VehiclePresenter } from './vehicle';
import { Vehicle } from '../entities/vehicle';

describe('VehiclePresenter', () => {
    let presenter: VehiclePresenter;
    let mockVehicle: Vehicle;

    beforeEach(() => {
        presenter = new VehiclePresenter();
        mockVehicle = new Vehicle({
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            licensePlate: 'ABC-1234',
            clientId: 1
        }, 1);
    });

    describe('present', () => {
        it('should present vehicle with status code 201', () => {
            presenter.present(mockVehicle);

            expect(presenter.getStatusCode()).toBe(201);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2022,
                    licensePlate: 'ABC-1234',
                    clientId: 1
                }
            });
        });

        it('should present vehicle without id', () => {
            const vehicleWithoutId = new Vehicle({
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'DEF-5678',
                clientId: 2
            });

            presenter.present(vehicleWithoutId);

            expect(presenter.getStatusCode()).toBe(201);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: {
                    id: undefined,
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'DEF-5678',
                    clientId: 2
                }
            });
        });
    });

    describe('presentList', () => {
        it('should present list of vehicles', () => {
            const vehicle2 = new Vehicle({
                brand: 'Honda',
                model: 'Civic',
                year: 2021,
                licensePlate: 'DEF-5678',
                clientId: 2
            }, 2);

            presenter.presentList([mockVehicle, vehicle2]);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: [
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
                ]
            });
        });

        it('should present empty list', () => {
            presenter.presentList([]);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: []
            });
        });
    });

    describe('presentFound', () => {
        it('should present found vehicle', () => {
            presenter.presentFound(mockVehicle);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2022,
                    licensePlate: 'ABC-1234',
                    clientId: 1
                }
            });
        });
    });

    describe('presentUpdated', () => {
        it('should present updated vehicle', () => {
            presenter.presentUpdated(mockVehicle);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                data: {
                    id: 1,
                    brand: 'Toyota',
                    model: 'Corolla',
                    year: 2022,
                    licensePlate: 'ABC-1234',
                    clientId: 1
                }
            });
        });
    });

    describe('presentDeleted', () => {
        it('should present deleted vehicle', () => {
            presenter.presentDeleted(mockVehicle);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                success: true,
                message: 'Veículo com ID 1 deletado com sucesso'
            });
        });
    });
});