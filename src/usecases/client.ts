import { NotFoundHttpError } from "../api/errors/http-errors";
import { Client } from "../entities/client";
import { ClientGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class ClientUseCases {
  constructor(private clientGateway: ClientGatewayInterface) { }

  async createClient(client: Client): Promise<Client> {
    const existingClient = await this.clientGateway.findByIdentifier(client.identifier);

    if (existingClient) {
      throw new ConflictError('Cliente com este identificador já existe');
    }

    const savedClientDTO = await this.clientGateway.insert(client);

    return new Client({
      name: savedClientDTO.name,
      identifier: savedClientDTO.identifier
    }, savedClientDTO.id);
  }

  async findClientById(id: number): Promise<Client | null> {
    const clientDTO = await this.clientGateway.findById(id);

    if (!clientDTO) {
      throw new NotFoundHttpError('Cliente');
    }

    return new Client({
      name: clientDTO.name,
      identifier: clientDTO.identifier
    }, clientDTO.id);
  }

  async findAllClients(): Promise<Client[]> {
    const clientsDTO = await this.clientGateway.findAll();
    return clientsDTO.map(clientDTO => new Client({
      name: clientDTO.name,
      identifier: clientDTO.identifier
    }, clientDTO.id));
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

    const updatedClientDTO = await this.clientGateway.update(id, { name, identifier: identifier ?? client.identifier });

    return new Client({
      name: updatedClientDTO.name,
      identifier: updatedClientDTO.identifier
    }, updatedClientDTO.id);
  }

  async deleteClient(id: number): Promise<void> {
    const client = await this.clientGateway.findById(id);

    if (!client) {
      throw new NotFoundHttpError('Cliente');
    }

   await this.clientGateway.delete(id);
  }
}
