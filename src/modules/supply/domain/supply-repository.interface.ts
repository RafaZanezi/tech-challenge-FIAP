import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Supply } from '../domain/supply.entity';

export interface SupplyRepository extends Repository<Supply> {
  findByName(name: string): Promise<Supply | null>;
}
