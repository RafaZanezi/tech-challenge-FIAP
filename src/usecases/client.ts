import { NotFoundHttpError } from "../api/errors/http-errors";
import { Client } from "../entities/client";
import { ClientGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class ClientUseCases {
  constructor(private clientGateway: ClientGatewayInterface) { }

  async createClient(data: Client): Promise<Client> {
    const existingClient = await this.clientGateway.findByIdentifier(data.identifier);

    if (existingClient) {
      throw new ConflictError('Cliente com este identificador já existe');
    }

    const client = new Client({
      name: data.name,
      identifier: data.identifier
    });

    const savedClient = await this.clientGateway.insert(client);

    return savedClient;
  }

  async findClientById(id: number): Promise<Client | null> {
    const client = await this.clientGateway.findById(id);

    if (!client) {
      throw new Error(`Cliente com id ${id} não encontrado`);
    }

    return client;
  }

  async findAllClients(): Promise<Client[]> {
    return await this.clientGateway.findAll();
  }

  async updateClient(id: number, data: Client): Promise<Client> {
    const { name, identifier } = data;

    const client = await this.clientGateway.findById(id);

    if (!client) {
      throw new NotFoundHttpError('Cliente');
    }

    if (identifier) {
      const existingIdentifier = await this.clientGateway.findByIdentifier(identifier);

      if (existingIdentifier && existingIdentifier.id !== id) {
        throw new ConflictError('Cliente com este identificador já existe');
      }
    }

    const updatedClient = await this.clientGateway.update(id, { name, identifier: identifier ?? client.identifier });

    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    const client = await this.clientGateway.findById(id);

    if (!client) {
      throw new NotFoundHttpError('Cliente');
    }

    return this.clientGateway.delete(id);
  }
}
