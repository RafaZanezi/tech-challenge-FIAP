import { Service } from '../entities/service';
import { ServiceDTO } from '../dtos/service';
import { BasePresenter } from './base-presenter';

export class ServicePresenter extends BasePresenter {
  present(service: Service): void {
    this.statusCode = 201;
    const { id, name, description, price } = service;

    this.response = {
      success: true,
      data: {
        id,
        name,
        description,
        price: parseFloat(price.toString())
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
          price: parseFloat(service.price.toString())
        };
      })
    };
  }

  presentFound(service: Service): void {
    this.statusCode = 200;
    const { id, name, description, price } = service;

    this.response = {
      success: true,
      data: {
        id,
        name,
        description,
        price: parseFloat(price.toString())
      }
    };
  }

  presentUpdated(service: Service): void {
    this.statusCode = 200;
    const { id, name, description, price } = service;

    this.response = {
      success: true,
      data: {
        id,
        name,
        description,
        price: parseFloat(price.toString())
      }
    };
  }

  presentDeleted(service: Service): void {
    this.statusCode = 200;

    this.response = {
      success: true,
      message: `Serviço com ID ${service.id} deletado com sucesso`
    };
  }
}
