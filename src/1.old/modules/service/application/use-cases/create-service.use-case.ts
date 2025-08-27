import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { Service } from '../../domain/service.entity';
import { CreateServiceRequest, CreateServiceResponse } from '../dtos/create-service.dto';

export class CreateServiceUseCase implements UseCase<CreateServiceRequest, CreateServiceResponse> {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(request: CreateServiceRequest): Promise<CreateServiceResponse> {
    const existingService = await this.serviceRepository.findByName(request.name);

    if (existingService) {
      throw new ConflictError('Serviço com este nome já existe');
    }

    const service = new Service({
      name: request.name,
      description: request.description,
      price: request.price,
    });

    const savedService = await this.serviceRepository.save(service);

    return {
      id: savedService.id,
      name: savedService.name,
      description: savedService.description,
      price: savedService.price,
    };
  }
}
