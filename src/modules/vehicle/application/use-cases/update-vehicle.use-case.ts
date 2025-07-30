import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { UpdateVehicleRequest, UpdateVehicleResponse } from '../dtos/update-vehicle.dto';

export class UpdateVehicleUseCase implements UseCase<UpdateVehicleRequest, UpdateVehicleResponse> {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(request: UpdateVehicleRequest): Promise<UpdateVehicleResponse> {
    const vehicle = await this.vehicleRepository.findById(request.id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle', request.id.toString());
    }

    // Create new vehicle with updated data
    const updatedVehicle = new Vehicle({
      brand: request.brand ?? vehicle.brand,
      model: request.model ?? vehicle.model,
      year: request.year ?? vehicle.year,
      licensePlate: request.licensePlate ?? vehicle.licensePlate,
      clientId: request.clientId ?? vehicle.clientId,
    }, request.id);

    const savedVehicle = await this.vehicleRepository.update(request.id, updatedVehicle);

    return {
      id: savedVehicle.id,
      brand: savedVehicle.brand,
      model: savedVehicle.model,
      year: savedVehicle.year,
      licensePlate: savedVehicle.licensePlate,
      clientId: savedVehicle.clientId,
    };
  }
}
