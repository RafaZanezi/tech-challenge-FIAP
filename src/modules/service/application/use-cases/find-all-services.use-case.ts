import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ServiceRepository } from '../../domain/service-repository.interface';
import { FindServiceResponse } from '../dtos/list-service.dto';

export class FindAllServicesUseCase implements UseCase<void, FindServiceResponse[]> {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(): Promise<FindServiceResponse[]> {
    const services = await this.serviceRepository.findAll();

    return services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
    }));
  }
}
