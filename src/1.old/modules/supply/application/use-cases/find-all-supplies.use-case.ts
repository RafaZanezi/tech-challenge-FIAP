import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { FindSupplyResponse } from '../dtos/list-supply.dto';

export class FindAllSuppliesUseCase implements UseCase<void, FindSupplyResponse[]> {
  constructor(private readonly supplyRepository: SupplyRepository) {}

  public async execute(): Promise<FindSupplyResponse[]> {
    const supplies = await this.supplyRepository.findAll();

    return supplies.map(supply => ({
      id: supply.id,
      name: supply.name,
      quantity: supply.quantity,
      price: supply.price,
    }));
  }
}
