import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { ServiceRepository } from '../../domain/service-repository.interface';

export class DeleteServiceUseCase implements UseCase<number, void> {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(id: number): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
      throw new NotFoundError('Service', id.toString());
    }

    await this.serviceRepository.delete(id);
  }
}
