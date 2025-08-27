import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ClientRepository } from '../../domain/client-repository.interface';
import { DeleteClientRequest } from '../dtos/delete-client.dto';

export class DeleteClientUseCase implements UseCase<DeleteClientRequest, void> {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(request: DeleteClientRequest): Promise<void> {
    await this.clientRepository.delete(request.id);
  }
}
