import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';

export class DeleteVehicleUseCase implements UseCase<number, void> {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  public async execute(id: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle', id.toString());
    }

    await this.vehicleRepository.delete(id);
  }
}
