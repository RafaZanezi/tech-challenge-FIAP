import connection from '../../../../shared/infrastructure/database/connection';
import { Vehicle, VehicleProps } from '../../domain/vehicle.entity';
import { VehicleRepository } from '../../domain/vehicle-repository.interface';

export class PostgresVehicleRepository implements VehicleRepository {
  
  public async findById(id: number): Promise<Vehicle | null> {
    const result = await connection.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  public async findAll(): Promise<Vehicle[]> {
    const result = await connection.query('SELECT * FROM vehicles ORDER BY id DESC');
    return result.rows.map((row) => this.mapToEntity(row));
  }

  public async save(entity: Vehicle): Promise<Vehicle> {
    const result = await connection.query(
      'INSERT INTO vehicles (brand, model, year, license_plate, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [entity.brand, entity.model, entity.year, entity.licensePlate, entity.clientId]
    );

    return this.mapToEntity(result.rows[0]);
  }

  public async update(id: number, entity: Partial<Vehicle>): Promise<Vehicle> {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (entity.brand) {
      setClause.push(`brand = $${paramCount++}`);
      values.push(entity.brand);
    }

    if (entity.model) {
      setClause.push(`model = $${paramCount++}`);
      values.push(entity.model);
    }

    if (entity.year) {
      setClause.push(`year = $${paramCount++}`);
      values.push(entity.year);
    }

    if (entity.licensePlate) {
      setClause.push(`license_plate = $${paramCount++}`);
      values.push(entity.licensePlate);
    }

    if (entity.clientId) {
      setClause.push(`client_id = $${paramCount++}`);
      values.push(entity.clientId);
    }

    values.push(id);

    const result = await connection.query(
      `UPDATE vehicles SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Vehicle not found for update');
    }

    return this.mapToEntity(result.rows[0]);
  }

  public async delete(id: number): Promise<void> {
    await connection.query('DELETE FROM vehicles WHERE id = $1', [id]);
  }

  public async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const result = await connection.query(
      'SELECT * FROM vehicles WHERE license_plate = $1',
      [licensePlate]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  public async findByClientId(clientId: number): Promise<Vehicle[]> {
    const result = await connection.query(
      'SELECT * FROM vehicles WHERE client_id = $1 ORDER BY id DESC',
      [clientId]
    );

    return result.rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: any): Vehicle {
    const props: VehicleProps = {
      brand: row.brand,
      model: row.model,
      year: row.year,
      licensePlate: row.license_plate,
      clientId: row.client_id,
    };

    return new Vehicle(props, row.id);
  }
}
