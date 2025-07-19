import { Client, ClientProps } from '../../domain/client.entity';
import { ClientRepository } from '../../domain/client-repository.interface';
import connection from '../../../../shared/infrastructure/database/connection';

export class PostgresClientRepository implements ClientRepository {
  async findById(id: string): Promise<Client | null> {
    const result = await connection.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  async findAll(): Promise<Client[]> {
    const result = await connection.query('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows.map(row => this.mapToEntity(row));
  }

  async findByIdentifier(identifier: string): Promise<Client | null> {
    const result = await connection.query(
      'SELECT * FROM clients WHERE identifier = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  async save(entity: Client): Promise<Client> {
    const result = await connection.query(
      'INSERT INTO clients (id, name, identifier, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [entity.id, entity.name, entity.identifier, entity.createdAt, entity.updatedAt]
    );

    return this.mapToEntity(result.rows[0]);
  }

  async update(id: string, entity: Partial<Client>): Promise<Client> {
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

    setClause.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);

    const result = await connection.query(
      `UPDATE clients SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return this.mapToEntity(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await connection.query('DELETE FROM clients WHERE id = $1', [id]);
  }

  private mapToEntity(row: any): Client {
    const props: ClientProps = {
      name: row.name,
      identifier: row.identifier,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new Client(props, row.id);
  }
}
