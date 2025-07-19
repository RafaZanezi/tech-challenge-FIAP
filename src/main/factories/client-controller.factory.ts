import { CreateClientUseCase } from '../../modules/client/application/use-cases/create-client.use-case';
import { PostgresClientRepository } from '../../modules/client/infrastructure/repositories/postgres-client.repository';
import ClientController from '../../modules/client/presentation/controllers/client.controller';

export function makeClientController(): ClientController {
  const clientRepository = new PostgresClientRepository();
  const createClientUseCase = new CreateClientUseCase(clientRepository);
  const clientController = new ClientController(createClientUseCase);

  return clientController;
}
