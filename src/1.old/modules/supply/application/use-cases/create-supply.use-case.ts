import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { ConflictError } from '../../../../shared/domain/errors/domain-errors';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { Supply } from '../../domain/supply.entity';
import { CreateSupplyRequest, CreateSupplyResponse } from '../dtos/create-supply.dto';

export class CreateSupplyUseCase implements UseCase<CreateSupplyRequest, CreateSupplyResponse> {
  constructor(private readonly supplyRepository: SupplyRepository) {}

  public async execute(request: CreateSupplyRequest): Promise<CreateSupplyResponse> {
    const existingSupply = await this.supplyRepository.findByName(request.name);

    if (existingSupply) {
      throw new ConflictError('Insumo com este nome já existe, atualize a quantidade de itens ao invés de criar um novo.');
    }

    const supply = new Supply({
      name: request.name,
      quantity: request.quantity,
      price: request.price,
    });

    const savedSupply = await this.supplyRepository.save(supply);

    return {
      id: savedSupply.id,
      name: savedSupply.name,
      quantity: savedSupply.quantity,
      price: savedSupply.price,
    };
  }
}
