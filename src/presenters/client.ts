import { BasePresenter } from './base-presenter';

export class ClientCreatedPresenter extends BasePresenter {
  present(client: any): void {
    this.statusCode = 201;
    this.response = {
      success: true,
      data: {
        id: client.id,
        name: client.name,
        identifier: client.identifier
      }
    };
  }
}