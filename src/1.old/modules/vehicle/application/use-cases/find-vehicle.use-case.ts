import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { FindVehicleRequest, FindVehicleResponse } from '../dtos/list-vehicle.dto';

export class FindVehicleUseCase implements UseCase<FindVehicleRequest, FindVehicleResponse> {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(request: FindVehicleRequest): Promise<FindVehicleResponse> {
    const vehicle = await this.vehicleRepository.findById(request.id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle', request.id.toString());
    }

    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      clientId: vehicle.clientId,
    };
  }
}
