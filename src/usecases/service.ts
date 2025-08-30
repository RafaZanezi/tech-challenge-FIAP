import { NotFoundHttpError } from "../api/errors/http-errors";
import { Service } from "../entities/service";
import { ServiceGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class ServiceUseCases {
  constructor(private serviceGateway: ServiceGatewayInterface) { }

  async createService(data: Service): Promise<Service> {
    const existingService = await this.serviceGateway.findByName(data.name);

    if (existingService) {
      throw new ConflictError('Serviço com este nome já existe');
    }

    const service = new Service({
      name: data.name,
      description: data.description,
      price: data.price
    });

    const savedService = await this.serviceGateway.insert(service);

    return savedService;
  }

  async findServiceById(id: number): Promise<Service | null> {
    const service = await this.serviceGateway.findById(id);

    if (!service) {
      throw new Error(`Serviço com id ${id} não encontrado`);
    }

    return service;
  }

  async findAllServices(): Promise<Service[]> {
    return await this.serviceGateway.findAll();
  }

  async updateService(id: number, data: Service): Promise<Service> {
    const { name, description, price } = data;

    const service = await this.serviceGateway.findById(id);

    if (!service) {
      throw new NotFoundHttpError('Serviço');
    }

    if (name) {
      const existingService = await this.serviceGateway.findByName(name);

      if (existingService && existingService.id !== id) {
        throw new ConflictError('Serviço com este nome já existe');
      }
    }

    const updatedService = await this.serviceGateway.update(id, {
      name: name ?? service.name,
      description: description ?? service.description,
      price: price ?? service.price
    });

    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    const service = await this.serviceGateway.findById(id);

    if (!service) {
      throw new NotFoundHttpError('Serviço');
    }

    return this.serviceGateway.delete(id);
  }
}