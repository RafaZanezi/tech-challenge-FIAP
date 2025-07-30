import { CreateServiceUseCase } from "../../modules/service/application/use-cases/create-service.use-case";
import { DeleteServiceUseCase } from "../../modules/service/application/use-cases/delete-service.use-case";
import { FindAllServicesUseCase } from "../../modules/service/application/use-cases/find-all-services.use-case";
import { FindServiceUseCase } from "../../modules/service/application/use-cases/find-service.use-case";
import { UpdateServiceUseCase } from "../../modules/service/application/use-cases/update-service.use-case";
import { PostgresServiceRepository } from "../../modules/service/infrastructure/repositories/postgres-service.repository";
import ServiceController from "../../modules/service/presentation/controllers/service.controller";

export function makeServiceController(): ServiceController {
    const serviceRepository = new PostgresServiceRepository();

    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
    const findAllServicesUseCase = new FindAllServicesUseCase(serviceRepository);
    const findServiceUseCase = new FindServiceUseCase(serviceRepository);
    const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);

    const serviceController = new ServiceController(
        createServiceUseCase,
        updateServiceUseCase,
        findAllServicesUseCase,
        findServiceUseCase,
        deleteServiceUseCase
    );

    return serviceController;
}
