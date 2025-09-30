import { ServiceOrderAdapter } from "../adapters/service-order-adapter";
import { NotFoundHttpError } from "../api/errors/http-errors";
import { Service } from "../entities/service";
import { ServiceOrder } from "../entities/service-order";
import { Supply } from "../entities/supply";
import { ServiceOrderStatus } from "../interfaces/enums/service-order-status.enum";
import { ServiceOrderGatewayInterface, ClientGatewayInterface, VehicleGatewayInterface } from "../interfaces/gateways";
import { ConflictError, ValidationError } from "./errors/errors";

export class ServiceOrderUseCases {
  constructor(
    private serviceOrderGateway: ServiceOrderGatewayInterface,
    private clientGateway: ClientGatewayInterface,
    private vehicleGateway: VehicleGatewayInterface
  ) { }

  async createServiceOrder(data: {
    clientId: number;
    vehicleId: number;
    services: Service[];
    supplies?: Supply[];
  }): Promise<ServiceOrder> {
    
    // Verificar se o cliente existe
    const client = await this.clientGateway.findById(data.clientId);
    if (!client) {
      throw new ValidationError('Cliente não encontrado');
    }

    // Verificar se o veículo existe
    const vehicle = await this.vehicleGateway.findById(data.vehicleId);
    if (!vehicle) {
      throw new ValidationError('Veículo não encontrado');
    }

    // Verificar se já existe uma OS aberta para este cliente e veículo
    const existingOS = await this.serviceOrderGateway.findOpenOSByCarAndClient(
      data.vehicleId, 
      data.clientId
    );

    if (existingOS) {
      throw new ConflictError('Já existe uma ordem de serviço aberta para este cliente e veículo');
    }

    const serviceOrder = new ServiceOrder({
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      services: data.services,
      supplies: data.supplies || [],
      createdAt: new Date(),
      finalizedAt: null,
      status: ServiceOrderStatus.RECEIVED
    });

    const savedServiceOrderDTO = await this.serviceOrderGateway.create(serviceOrder);
    return ServiceOrderAdapter.adapt(savedServiceOrderDTO);
  }

  async findServiceOrderById(id: number): Promise<ServiceOrder | null> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    return  ServiceOrderAdapter.adapt(serviceOrderDTO);
  }

  async findAllServiceOrders(): Promise<ServiceOrder[]> {
    const serviceOrdersDTO = await this.serviceOrderGateway.findAll();
    return serviceOrdersDTO.map(serviceOrderDTO => ServiceOrderAdapter.adapt(serviceOrderDTO));
  }

  async findActiveServiceOrdersWithOrdering(): Promise<ServiceOrder[]> {
    const serviceOrdersDTO = await this.serviceOrderGateway.findAllActiveWithOrdering();
    return serviceOrdersDTO.map(serviceOrderDTO => ServiceOrderAdapter.adapt(serviceOrderDTO));
  }

  async getServiceOrderStatus(id: number): Promise<{ id: number; status: string }> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    return {
      id: serviceOrderDTO.id,
      status: serviceOrderDTO.status
    };
  }

  async approveOrderFromExternal(id: number, approved: boolean): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    
    if (approved) {
      serviceOrder.approveOrder();
    } else {
      serviceOrder.rejectOrder();
    }

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async updateServiceOrder(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderGateway.findById(id);

    if (!serviceOrder) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, data);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async startDiagnosis(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.startDiagnosis();

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async updateServicesAndSupplies(
    id: number, 
    services?: Service[], 
    supplies?: Supply[]
  ): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);

    if (services) {
      serviceOrder.updateServices(services);
    }

    if (supplies) {
      serviceOrder.updateSupplies(supplies);
    }

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async submitForApproval(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.submitForApproval();

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async approveOrder(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.approveOrder();

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async startExecution(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.startExecution();

    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async finalizeOrder(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.finalizeOrder();
    
    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async deliverOrder(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.deliverOrder();
    
    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async cancelOrder(id: number): Promise<ServiceOrder> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    const serviceOrder = ServiceOrderAdapter.adapt(serviceOrderDTO);
    serviceOrder.cancelOrder();
    
    const updatedServiceOrderDTO = await this.serviceOrderGateway.update(id, serviceOrder);
    return ServiceOrderAdapter.adapt(updatedServiceOrderDTO);
  }

  async deleteServiceOrder(id: number): Promise<void> {
    const serviceOrderDTO = await this.serviceOrderGateway.findById(id);

    if (!serviceOrderDTO) {
      throw new NotFoundHttpError('Ordem de serviço');
    }

    return this.serviceOrderGateway.delete(id);
  }

  private calculateTotalPrice(services: Service[], supplies: Supply[]): number {
    const servicesTotal = services.reduce((total, service) => total + (service.price || 0), 0);
    const suppliesTotal = supplies.reduce((total, supply) => total + (supply.price || 0), 0);
    return servicesTotal + suppliesTotal;
  }
}