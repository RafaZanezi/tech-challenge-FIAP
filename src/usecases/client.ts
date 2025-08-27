import { Client } from "../entities/client";
import { ClientGatewayInterface } from "../interfaces/gateways";

export class ClientUseCases {
  constructor(private clientGateway: ClientGatewayInterface) { }

  async createClient(data: Client): Promise<Client> {
    try {
      const existingClient = await this.clientGateway.findByIdentifier(data.identifier);

      if (existingClient) {
        //   throw new ConflictError('Cliente com este identificador já existe');
      }

      const client = new Client({
        name: data.name,
        identifier: data.identifier
      });

      const savedClient = await this.clientGateway.insert(client);

      return savedClient;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      // throw new ConflictHttpError('Falha ao criar cliente');
    }
  }

  async findClientById(id: number): Promise<Client | null> {
    try {
      const client = await this.clientGateway.findById(id);

      if (!client) {
        throw new Error(`Cliente com id ${id} não encontrado`);
      }

      return client;
    } catch (error) {
      console.error('Erro ao buscar cliente por ID:', error);
      // throw new NotFoundHttpError('Cliente não encontrado');
    }
  }

  async findAllClients(): Promise<Client[]> {
    try {
      const clients = await this.clientGateway.findAll();
      return clients;
    } catch (error) {
      console.error('Erro ao buscar todos os clientes:', error);
      // throw new NotFoundHttpError('Clientes não encontrados');
    }
  }

  async updateClient(id: number, data: Client): Promise<Client> {
    const { name, identifier } = data;

    try {
      const existingClient = await this.clientGateway.findByIdentifier(identifier);

      if (existingClient && existingClient.id !== id) {
        // throw new ConflictError('Cliente com este identificador já existe');
      }

      const updatedClient = await this.clientGateway.update(id, { name, identifier });

      return updatedClient;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      // throw new ConflictHttpError('Falha ao atualizar cliente');
    }
  }

  async deleteClient(id: number): Promise<void> {
    try {
      return this.clientGateway.delete(id);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      // throw new NotFoundHttpError('Cliente não encontrado');
    }
  }
}
