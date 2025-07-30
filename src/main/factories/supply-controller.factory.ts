import { CreateSupplyUseCase } from "../../modules/supply/application/use-cases/create-supply.use-case";
import { DeleteSupplyUseCase } from "../../modules/supply/application/use-cases/delete-supply.use-case";
import { FindAllSuppliesUseCase } from "../../modules/supply/application/use-cases/find-all-supplies.use-case";
import { FindSupplyUseCase } from "../../modules/supply/application/use-cases/find-supply.use-case";
import { UpdateSupplyUseCase } from "../../modules/supply/application/use-cases/update-supply.use-case";
import { PostgresSupplyRepository } from "../../modules/supply/infrastructure/repositories/postgres-supply.repository";
import SupplyController from "../../modules/supply/presentation/controllers/supply.controller";

export function makeSupplyController(): SupplyController {
    const supplyRepository = new PostgresSupplyRepository();

    const createSupplyUseCase = new CreateSupplyUseCase(supplyRepository);
    const updateSupplyUseCase = new UpdateSupplyUseCase(supplyRepository);
    const findAllSuppliesUseCase = new FindAllSuppliesUseCase(supplyRepository);
    const findSupplyUseCase = new FindSupplyUseCase(supplyRepository);
    const deleteSupplyUseCase = new DeleteSupplyUseCase(supplyRepository);

    const supplyController = new SupplyController(
        createSupplyUseCase,
        updateSupplyUseCase,
        findAllSuppliesUseCase,
        findSupplyUseCase,
        deleteSupplyUseCase
    );

    return supplyController;
}
