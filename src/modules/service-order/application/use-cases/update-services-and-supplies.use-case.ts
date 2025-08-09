import { UseCase } from "../../../../shared/application/interfaces/use-case.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain-errors";
import { ServiceRepository } from "../../../service/domain/service-repository.interface";
import { SupplyRepository } from "../../../supply/domain/supply-repository.interface";
import { ServiceOrderRepository } from "../../domain/service-order-repository.interface";
import { UpdateServiceOrderRequest, UpdateServiceOrderResponse } from "../dtos/update-os.dto";

export class UpdateServicesAndSuppliesUseCase implements UseCase<UpdateServiceOrderRequest, UpdateServiceOrderResponse> {

    constructor(
        private readonly serviceOrderRepository: ServiceOrderRepository,
        private readonly servicesRepository: ServiceRepository,
        private readonly suppliesRepository: SupplyRepository,
    ) { }

async execute(request: UpdateServiceOrderRequest): Promise<UpdateServiceOrderResponse> {
    const id = request.id;
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
        throw new NotFoundError('Ordem de serviço', String(id));
    }

    await this.validateServices(serviceOrder.services);
    await this.validateSupplies(serviceOrder.supplies);

    if (request.services) {
        const servicesEntities = await this.getEntitiesByIds(request.services, this.servicesRepository, 'Serviço');
        serviceOrder.updateServices(servicesEntities);
    }

    if (request.supplies) {
        const suppliesEntities = await this.getEntitiesByIds(request.supplies, this.suppliesRepository, 'Suprimento');
        serviceOrder.updateSupplies(suppliesEntities);
    }

    const response = await this.serviceOrderRepository.update(serviceOrder.id, serviceOrder);

    return {
        clientId: response.clientId,
        vehicleId: response.vehicleId,
        services: response.services.map(service => service.id),
        supplies: response.supplies.map(supply => supply.id),
        createdAt: response.createdAt,
        finalizedAt: response.finalizedAt,
        status: response.status,
    };
}

private async validateServices(services: { id: number }[]): Promise<void> {
    for (const service of services) {
        const serviceExists = await this.servicesRepository.findById(service.id);
        if (!serviceExists) {
            throw new NotFoundError('Serviço', String(service.id));
        }
    }
}

private async validateSupplies(supplies: { id: number }[]): Promise<void> {
    for (const supply of supplies) {
        const supplyExists = await this.suppliesRepository.findById(supply.id);
        if (!supplyExists) {
            throw new NotFoundError('Suprimento', String(supply.id));
        }
    }
}

private async getEntitiesByIds(
    ids: number[],
    repository: { findById(id: number): Promise<any> },
    entityName: string
): Promise<any[]> {
    const entities = [];
    for (const id of ids) {
        const entity = await repository.findById(id);
        if (!entity) {
            throw new NotFoundError(entityName, String(id));
        }
        entities.push(entity);
    }
    return entities;
}

}
