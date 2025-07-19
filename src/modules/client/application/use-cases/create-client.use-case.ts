import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client } from '../../domain/client.entity';
import { CreateClientRequest, CreateClientResponse } from '../dtos/create-client.dto';

export class CreateClientUseCase implements UseCase<CreateClientRequest, CreateClientResponse> {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(request: CreateClientRequest): Promise<CreateClientResponse> {
    // Verificar se já existe um cliente com esse identificador
    const existingClient = await this.clientRepository.findByIdentifier(request.identifier);

    if (existingClient) {
      throw new ConflictError('Client with this identifier already exists');
    }

    // Criar nova instância do cliente
    const client = new Client({
      name: request.name,
      identifier: request.identifier,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Salvar no repositório
    const savedClient = await this.clientRepository.save(client);

    return {
      id: savedClient.id,
      name: savedClient.name,
      identifier: savedClient.identifier,
      createdAt: savedClient.createdAt
    };
  }
}
