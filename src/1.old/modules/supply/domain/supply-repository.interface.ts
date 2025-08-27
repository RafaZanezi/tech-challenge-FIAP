import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Supply } from '../../../../entities/supply';

export interface SupplyRepository extends Repository<Supply> {
  findByName(name: string): Promise<Supply | null>;
}
