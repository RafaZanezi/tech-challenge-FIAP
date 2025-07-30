import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Service } from '../domain/service.entity';

export interface ServiceRepository extends Repository<Service> {
  findByName(name: string): Promise<Service | null>;
}
