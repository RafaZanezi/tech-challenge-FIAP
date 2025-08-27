import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ClientRepository } from '../../domain/client-repository.interface';
import { FindClientResponse } from '../dtos/list-client.dto';

export class FindAllClientsUseCase implements UseCase<void, FindClientResponse[]> {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(): Promise<FindClientResponse[]> {
    const clients = await this.clientRepository.findAll();

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      identifier: client.identifier
    }));
  }
}
