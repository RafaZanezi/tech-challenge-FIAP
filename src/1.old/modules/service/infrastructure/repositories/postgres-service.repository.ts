import { Service } from '../../domain/service.entity';
import { ServiceRepository } from '../../domain/service-repository.interface';
import db from '../../../../shared/infrastructure/database/connection';

export class PostgresServiceRepository implements ServiceRepository {
  
  async findById(id: number): Promise<Service | null> {
    try {
      const result = await db.query(
        'SELECT id, name, description, price FROM services WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Service(
        {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error finding service by id:', error);
      throw new Error('Failed to find service by id');
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const result = await db.query(
        'SELECT id, name, description, price FROM services ORDER BY name'
      );

      return result.rows.map(row => new Service(
        {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price)
        },
        row.id
      ));
    } catch (error) {
      console.error('Error finding all services:', error);
      throw new Error('Failed to find all services');
    }
  }

  async save(entity: Service): Promise<Service> {
    try {
      const result = await db.query(
        'INSERT INTO services (name, description, price) VALUES ($1, $2, $3) RETURNING id, name, description, price',
        [entity.name, entity.description, entity.price]
      );

      const row = result.rows[0];
      return new Service(
        {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error saving service:', error);
      throw new Error('Failed to save service');
    }
  }

  async update(id: number, entity: Partial<Service>): Promise<Service> {
    try {
      // First, get the current service to merge with partial updates
      const current = await this.findById(id);
      if (!current) {
        throw new Error('Service not found');
      }

      const updatedName = entity.name ?? current.name;
      const updatedDescription = entity.description ?? current.description;
      const updatedPrice = entity.price ?? current.price;

      const result = await db.query(
        'UPDATE services SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING id, name, description, price',
        [updatedName, updatedDescription, updatedPrice, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Service not found');
      }

      const row = result.rows[0];
      return new Service(
        {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await db.query(
        'DELETE FROM services WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error('Service not found');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  async findByName(name: string): Promise<Service | null> {
    try {
      const result = await db.query(
        'SELECT id, name, description, price FROM services WHERE name = $1',
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Service(
        {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error finding service by name:', error);
      throw new Error('Failed to find service by name');
    }
  }
}
