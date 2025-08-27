import connection from '../../../../shared/infrastructure/database/connection';
import { ClientRepository } from '../../domain/client-repository.interface';
import { Client, ClientProps } from '../../domain/client.entity';

export class PostgresClientRepository implements ClientRepository {
  public async findById(id: number): Promise<Client | null> {
    const result = await connection.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  public async findAll(): Promise<Client[]> {
    const result = await connection.query('SELECT * FROM clients ORDER BY id DESC');
    return result.rows.map((row) => this.mapToEntity(row));
  }

  public async findByIdentifier(identifier: string): Promise<Client | null> {
    const result = await connection.query(
      'SELECT * FROM clients WHERE identifier = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  public async save(entity: Client): Promise<Client> {
    const result = await connection.query(
      'INSERT INTO clients (name, identifier) VALUES ($1, $2) RETURNING *',
      [entity.name, entity.identifier]
    );

    return this.mapToEntity(result.rows[0]);
  }

  public async update(id: number, entity: Partial<Client>): Promise<Client> {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (entity.name) {
      setClause.push(`name = $${paramCount++}`);
      values.push(entity.name);
    }

    if (entity.identifier) {
      setClause.push(`identifier = $${paramCount++}`);
      values.push(entity.identifier);
    }

    values.push(id);

    const result = await connection.query(
      `UPDATE clients SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return this.mapToEntity(result.rows[0]);
  }

  public async delete(id: number): Promise<void> {
    await connection.query('DELETE FROM clients WHERE id = $1', [id]);
  }

  private mapToEntity(row: any): Client {
    const props: ClientProps = {
      name: row.name,
      identifier: row.identifier
    };

    return new Client(props, row.id);
  }
}
