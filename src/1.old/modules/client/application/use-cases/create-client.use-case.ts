import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../../../../entities/client';
import { CreateClientRequest, CreateClientResponse } from '../dtos/create-client';

export class CreateClientUseCase implements UseCase<CreateClientRequest, CreateClientResponse> {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(request: CreateClientRequest): Promise<CreateClientResponse> {
    const existingClient = await this.clientRepository.findByIdentifier(request.identifier);

    if (existingClient) {
      throw new ConflictError('Cliente com este identificador já existe');
    }

    const client = new Client({
      name: request.name,
      identifier: request.identifier
    });

    const savedClient = await this.clientRepository.save(client);

    return {
      id: savedClient.id,
      name: savedClient.name,
      identifier: savedClient.identifier
    };
  }
}
