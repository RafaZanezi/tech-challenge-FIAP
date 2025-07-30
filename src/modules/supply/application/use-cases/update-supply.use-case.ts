import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import { UpdateSupplyRequest, UpdateSupplyResponse } from '../dtos/update-supply.dto';

export class UpdateSupplyUseCase implements UseCase<UpdateSupplyRequest, UpdateSupplyResponse> {
  constructor(private readonly supplyRepository: SupplyRepository) {}

  public async execute(request: UpdateSupplyRequest): Promise<UpdateSupplyResponse> {
    const supply = await this.supplyRepository.findById(request.id);

    if (!supply) {
      throw new NotFoundError('Supply', request.id.toString());
    }

    if (request.name) {
      supply.updateName(request.name);
    }

    if (request.quantity !== undefined) {
      supply.updateQuantity(request.quantity);
    }

    if (request.price !== undefined) {
      supply.updatePrice(request.price);
    }

    const updatedSupply = await this.supplyRepository.update(request.id, supply);

    return {
      id: updatedSupply.id,
      name: updatedSupply.name,
      quantity: updatedSupply.quantity,
      price: updatedSupply.price,
    };
  }
}
