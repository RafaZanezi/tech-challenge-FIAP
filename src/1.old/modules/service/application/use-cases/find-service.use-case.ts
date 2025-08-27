import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { FindServiceRequest, FindServiceResponse } from '../dtos/list-service.dto';

export class FindServiceUseCase implements UseCase<FindServiceRequest, FindServiceResponse> {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(request: FindServiceRequest): Promise<FindServiceResponse> {
    const service = await this.serviceRepository.findById(request.id);

    if (!service) {
      throw new NotFoundError('Service', request.id.toString());
    }

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
    };
  }
}
