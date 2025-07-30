import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/domain-errors';
import { SupplyRepository } from '../../domain/supply-repository.interface';

export class DeleteSupplyUseCase implements UseCase<number, void> {
  constructor(private readonly supplyRepository: SupplyRepository) {}

  public async execute(id: number): Promise<void> {
    const supply = await this.supplyRepository.findById(id);

    if (!supply) {
      throw new NotFoundError('Supply', id.toString());
    }

    await this.supplyRepository.delete(id);
  }
}
