import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { UpdateServiceRequest, UpdateServiceResponse } from '../dtos/update-service.dto';

export class UpdateServiceUseCase implements UseCase<UpdateServiceRequest, UpdateServiceResponse> {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(request: UpdateServiceRequest): Promise<UpdateServiceResponse> {
    const service = await this.serviceRepository.findById(request.id);

    if (!service) {
      throw new NotFoundError('Serviço', request.id.toString());
    }

    if (request.name) {
      service.updateName(request.name);
    }

    if (request.description) {
      service.updateDescription(request.description);
    }

    if (request.price) {
      service.updatePrice(request.price);
    }

    const updatedService = await this.serviceRepository.update(request.id, service);

    return {
      id: updatedService.id,
      name: updatedService.name,
      description: updatedService.description,
      price: updatedService.price,
    };
  }
}
