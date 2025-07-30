import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { FindVehicleResponse } from '../dtos/list-vehicle.dto';

export class FindAllVehiclesUseCase implements UseCase<void, FindVehicleResponse[]> {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(): Promise<FindVehicleResponse[]> {
    const vehicles = await this.vehicleRepository.findAll();

    return vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      clientId: vehicle.clientId,
    }));
  }
}
