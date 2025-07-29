import { CreateClientUseCase } from '../../modules/client/application/use-cases/create-client.use-case';
import { DeleteClientUseCase } from '../../modules/client/application/use-cases/delete-client.use-case';
import { FindAllClientsUseCase } from '../../modules/client/application/use-cases/find-all-clients.use-case';
import { FindClientsUseCase } from '../../modules/client/application/use-cases/find-client.use-case';
import { UpdateClientUseCase } from '../../modules/client/application/use-cases/update-client.use-case';
import { PostgresClientRepository } from '../../modules/client/infrastructure/repositories/postgres-client.repository';
import ClientController from '../../modules/client/presentation/controllers/client.controller';

export function makeClientController(): ClientController {
    const clientRepository = new PostgresClientRepository();

    const createClientUseCase = new CreateClientUseCase(clientRepository);
    const updateClientUseCase = new UpdateClientUseCase(clientRepository);
    const findAllClientsUseCase = new FindAllClientsUseCase(clientRepository);
    const findClientUseCase = new FindClientsUseCase(clientRepository);
    const deleteClientUseCase = new DeleteClientUseCase(clientRepository);

    const clientController = new ClientController(createClientUseCase, updateClientUseCase, findAllClientsUseCase, findClientUseCase, deleteClientUseCase);

    return clientController;
}
