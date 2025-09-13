import { Service } from '../entities/service';
import { ServiceDTO } from '../dtos/service';
import { BasePresenter } from './base-presenter';

export class ServiceCreatedPresenter extends BasePresenter {
  present(service: Service): void {
    this.statusCode = 201;
    const { id, name, description, price } = service;

    this.response = {
      success: true,
      data: {
        id,
        name,
        description,
        price
      }
    };
  }

  presentList(services: Service[]) {
    this.statusCode = 200;

    this.response = {
      success: true,
      data: services.map(service => {
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price
        };
      })
    };
  }
}
