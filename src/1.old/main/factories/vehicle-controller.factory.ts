import { PostgresClientRepository } from '../../modules/client/infrastructure/repositories/postgres-client.repository';
import { CreateVehicleUseCase } from '../../modules/vehicle/application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../modules/vehicle/application/use-cases/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../../modules/vehicle/application/use-cases/find-all-vehicles.use-case';
import { FindVehicleUseCase } from '../../modules/vehicle/application/use-cases/find-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../modules/vehicle/application/use-cases/update-vehicle.use-case';
import { PostgresVehicleRepository } from '../../modules/vehicle/infrastructure/repositories/postgres-vehicle.repository';
import VehicleController from '../../modules/vehicle/presentation/controllers/vehicle.controller';

export function makeVehicleController(): VehicleController {
    const vehicleRepository = new PostgresVehicleRepository();
    const clientRepository = new PostgresClientRepository(); // Assuming you have a client repository similar to vehicle repository

    const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepository, clientRepository);
    const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepository);
    const findAllVehiclesUseCase = new FindAllVehiclesUseCase(vehicleRepository);
    const findVehicleUseCase = new FindVehicleUseCase(vehicleRepository);
    const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository);

    const vehicleController = new VehicleController(
        createVehicleUseCase, 
        updateVehicleUseCase, 
        findAllVehiclesUseCase, 
        findVehicleUseCase, 
        deleteVehicleUseCase
    );

    return vehicleController;
}
