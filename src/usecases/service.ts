import { NotFoundHttpError } from "../api/errors/http-errors";
import { Service } from "../entities/service";
import { ServiceGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class ServiceUseCases {
  constructor(private serviceGateway: ServiceGatewayInterface) { }

  async createService(service: Service): Promise<Service> {
    const existingService = await this.serviceGateway.findByName(service.name);

    if (existingService) {
      throw new ConflictError('Serviço com este nome já existe');
    }

    const savedServiceDTO = await this.serviceGateway.insert(service);

    return new Service({
      name: savedServiceDTO.name,
      description: savedServiceDTO.description,
      price: savedServiceDTO.price
    }, savedServiceDTO.id);
  }

  async findServiceById(id: number): Promise<Service | null> {
    const serviceDTO = await this.serviceGateway.findById(id);

    if (!serviceDTO) {
      throw new NotFoundHttpError('Serviço');
    }

    return new Service({
      name: serviceDTO.name,
      description: serviceDTO.description,
      price: serviceDTO.price
    }, serviceDTO.id);
  }

  async findAllServices(): Promise<Service[]> {
    const servicesDTO = await this.serviceGateway.findAll();
    return servicesDTO.map(serviceDTO => new Service({
      name: serviceDTO.name,
      description: serviceDTO.description,
      price: serviceDTO.price
    }, serviceDTO.id));
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

    const updatedServiceDTO = await this.serviceGateway.update(id, { 
      name, 
      description: description ?? service.description, 
      price: price ?? service.price 
    });

    return new Service({
      name: updatedServiceDTO.name,
      description: updatedServiceDTO.description,
      price: updatedServiceDTO.price
    }, updatedServiceDTO.id);
  }

  async deleteService(id: number): Promise<void> {
    const service = await this.serviceGateway.findById(id);

    if (!service) {
      throw new NotFoundHttpError('Serviço');
    }

   await this.serviceGateway.delete(id);
  }
}