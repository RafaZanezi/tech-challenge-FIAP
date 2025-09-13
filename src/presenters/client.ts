import { Client } from '../entities/client';
import { BasePresenter } from './base-presenter';

export class ClientCreatedPresenter extends BasePresenter {
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
}