import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Service } from './service.entity';

export interface ServiceRepository extends Repository<Service> {
  findByName(name: string): Promise<Service | null>;
}
