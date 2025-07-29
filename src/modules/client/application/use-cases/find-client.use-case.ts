import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ClientRepository } from '../../domain/client-repository.interface';
import { FindClientRequest, FindClientResponse } from '../dtos/list-client.dto';

export class FindClientsUseCase implements UseCase<FindClientRequest, FindClientResponse> {
  constructor(private readonly clientRepository: ClientRepository) { }

  public async execute(request: FindClientRequest): Promise<FindClientResponse> {
    const client = await this.clientRepository.findById(request.id);

    if (!client) {
      throw new Error(`Cliente com id ${request.id} não encontrado`);
    }

    return {
      id: client.id,
      name: client.name,
      identifier: client.identifier
    };
  }
}
