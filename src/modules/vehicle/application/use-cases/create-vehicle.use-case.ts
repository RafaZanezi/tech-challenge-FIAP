import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { ClientRepository } from '../../../client/domain/client-repository.interface';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';
import { Vehicle } from '../../domain/vehicle.entity';
import { CreateVehicleRequest, CreateVehicleResponse } from '../dtos/create-vehicle.dto';

export class CreateVehicleUseCase implements UseCase<CreateVehicleRequest, CreateVehicleResponse> {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly clientRepository: ClientRepository // Assuming you have a client repository for client validation
  ) {}

  public async execute(request: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const existingVehicle = await this.vehicleRepository.findByLicensePlate(request.licensePlate);

    if (existingVehicle) {
      throw new ConflictError('Veículo com esta placa já existe');
    }

    const client = await this.clientRepository.findById(request.clientId);

    if(!client) {
      throw new NotFoundError('Client', request.clientId.toString());
    }

    const vehicle = new Vehicle({
      brand: request.brand,
      model: request.model,
      year: request.year,
      licensePlate: request.licensePlate,
      clientId: request.clientId,
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);

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
