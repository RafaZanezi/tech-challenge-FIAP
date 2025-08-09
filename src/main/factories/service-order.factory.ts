import { CreateOSUseCase } from "../../modules/service-order/application/use-cases/create-os.use-case";
import { FindAllOSUseCase } from "../../modules/service-order/application/use-cases/find-all-os.use-case";
import { FindOSUseCase } from "../../modules/service-order/application/use-cases/find-os.use-case";
import { UpdateOSUseCase } from "../../modules/service-order/application/use-cases/update-os.use-case";
import { UpdateServicesAndSuppliesUseCase } from "../../modules/service-order/application/use-cases/update-services-and-supplies.use-case";
import { PostgresServiceOrderRepository } from "../../modules/service-order/infrastructure/repositories/postgres-service-order.repository";
import ServiceOrderController from "../../modules/service-order/presentation/controllers/service-order.controller";
import { PostgresServiceRepository } from "../../modules/service/infrastructure/repositories/postgres-service.repository";
import { PostgresSupplyRepository } from "../../modules/supply/infrastructure/repositories/postgres-supply.repository";

export function makeOSController(): ServiceOrderController {
    const serviceOrderRepository = new PostgresServiceOrderRepository();
    const servicesRepository = new PostgresServiceRepository();
    const suppliesRepository = new PostgresSupplyRepository();

    const createOSUseCase = new CreateOSUseCase(serviceOrderRepository);
    const updateOSUseCase = new UpdateOSUseCase(serviceOrderRepository);
    
    const updateServicesAndSuppliesUseCase = new UpdateServicesAndSuppliesUseCase(
        serviceOrderRepository,
        servicesRepository,
        suppliesRepository
    );

    const findAllOSUseCase = new FindAllOSUseCase(serviceOrderRepository);
    const findOSUseCase = new FindOSUseCase(serviceOrderRepository);

    const supplyController = new ServiceOrderController(
        createOSUseCase,
        updateOSUseCase,
        updateServicesAndSuppliesUseCase,
        findAllOSUseCase,
        findOSUseCase,
    );

    return supplyController;
}
