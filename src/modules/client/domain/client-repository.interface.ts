import { Repository } from '../../../shared/application/interfaces/repository.interface';
import { Client } from '../domain/client.entity';

export interface ClientRepository extends Repository<Client> {
  findByIdentifier(identifier: string): Promise<Client | null>;
}
