import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { FindSupplyRequest, FindSupplyResponse } from '../dtos/list-supply.dto';

export class FindSupplyUseCase implements UseCase<FindSupplyRequest, FindSupplyResponse> {
  constructor(private readonly supplyRepository: SupplyRepository) {}

  public async execute(request: FindSupplyRequest): Promise<FindSupplyResponse> {
    const supply = await this.supplyRepository.findById(request.id);

    if (!supply) {
      throw new NotFoundError('Supply', request.id.toString());
    }

    return {
      id: supply.id,
      name: supply.name,
      quantity: supply.quantity,
      price: supply.price,
    };
  }
}
