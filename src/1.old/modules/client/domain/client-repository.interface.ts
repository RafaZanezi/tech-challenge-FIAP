import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Client } from './client.entity';

export interface ClientRepository extends Repository<Client> {
  findByIdentifier(identifier: string): Promise<Client | null>;
}
