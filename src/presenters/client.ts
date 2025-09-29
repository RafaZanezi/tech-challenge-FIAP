import { Client } from '../entities/client';
import { BasePresenter } from './base-presenter';

export class ClientPresenter extends BasePresenter {
  present(clientDTO: Client): void {
    this.statusCode = 201;

    const { id, name, identifier } = clientDTO

    this.response = {
      success: true,
      data: {
        id,
        name,
        identifier
      }
    };
  }

  presentList(clients: Client[]) {
    this.statusCode = 200;

    this.response = {
      success: true,
      data: clients.map(client => ({
        id: client.id,
        name: client.name,
        identifier: client.identifier
      }))
    };
  }

  presentFound(client: Client): void {
    this.statusCode = 200;
    const { id, name, identifier } = client;

    this.response = {
      success: true,
      data: {
        id,
        name,
        identifier
      }
    };
  }

  presentUpdated(client: Client): void {
    this.statusCode = 200;
    const { id, name, identifier } = client;

    this.response = {
      success: true,
      data: {
        id,
        name,
        identifier
      }
    };
  }

  presentDeleted(client: Client): void {
    this.statusCode = 200;

    this.response = {
      success: true,
      message: `Cliente com ID ${client.id} deletado com sucesso`
    };
  }
}