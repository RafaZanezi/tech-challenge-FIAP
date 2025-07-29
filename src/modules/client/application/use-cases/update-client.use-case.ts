import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { ConflictHttpError } from '../../../../shared/domain/errors/http-errors';
import { ClientRepository } from '../../domain/client-repository.interface';
import { UpdateClientRequest, UpdateClientResponse } from '../dtos/update-client.dto';

export class UpdateClientUseCase implements UseCase<UpdateClientRequest, UpdateClientResponse> {
    constructor(private readonly clientRepository: ClientRepository) { }

    public async execute(request: UpdateClientRequest): Promise<UpdateClientResponse> {
        const { id, name, identifier } = request;

        try {
            const existingClient = await this.clientRepository.findByIdentifier(request.identifier);

            if (existingClient) {
                throw new ConflictError('Cliente com este identificador já existe');
            }

            const updatedClient = await this.clientRepository.update(id, { name, identifier });

            return {
                id: updatedClient.id || 0,
                name: updatedClient.name || name,
                identifier: updatedClient.identifier || identifier
            };
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw new ConflictHttpError('Falha ao atualizar cliente');
        }
    }
}
