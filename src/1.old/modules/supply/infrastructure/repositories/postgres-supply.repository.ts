import { Supply } from '../../domain/supply.entity';
import { SupplyRepository } from '../../domain/supply-repository.interface';
import db from '../../../../shared/infrastructure/database/connection';

export class PostgresSupplyRepository implements SupplyRepository {
  
  async findById(id: number): Promise<Supply | null> {
    try {
      const result = await db.query(
        'SELECT id, name, quantity, price FROM supplies WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Supply(
        {
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error finding supply by id:', error);
      throw new Error('Failed to find supply by id');
    }
  }

  async findAll(): Promise<Supply[]> {
    try {
      const result = await db.query(
        'SELECT id, name, quantity, price FROM supplies ORDER BY name'
      );

      return result.rows.map(row => new Supply(
        {
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price)
        },
        row.id
      ));
    } catch (error) {
      console.error('Error finding all supplies:', error);
      throw new Error('Failed to find all supplies');
    }
  }

  async save(entity: Supply): Promise<Supply> {
    try {
      const result = await db.query(
        'INSERT INTO supplies (name, quantity, price) VALUES ($1, $2, $3) RETURNING id, name, quantity, price',
        [entity.name, entity.quantity, entity.price]
      );

      const row = result.rows[0];
      return new Supply(
        {
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error saving supply:', error);
      throw new Error('Failed to save supply');
    }
  }

  async update(id: number, entity: Partial<Supply>): Promise<Supply> {
    try {
      // First, get the current supply to merge with partial updates
      const current = await this.findById(id);
      if (!current) {
        throw new Error('Supply not found');
      }

      const updatedName = entity.name ?? current.name;
      const updatedQuantity = entity.quantity ?? current.quantity;
      const updatedPrice = entity.price ?? current.price;

      const result = await db.query(
        'UPDATE supplies SET name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING id, name, quantity, price',
        [updatedName, updatedQuantity, updatedPrice, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Supply not found');
      }

      const row = result.rows[0];
      return new Supply(
        {
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error updating supply:', error);
      throw new Error('Failed to update supply');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await db.query(
        'DELETE FROM supplies WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error('Supply not found');
      }
    } catch (error) {
      console.error('Error deleting supply:', error);
      throw new Error('Failed to delete supply');
    }
  }

  async findByName(name: string): Promise<Supply | null> {
    try {
      const result = await db.query(
        'SELECT id, name, quantity, price FROM supplies WHERE name = $1',
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Supply(
        {
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price)
        },
        row.id
      );
    } catch (error) {
      console.error('Error finding supply by name:', error);
      throw new Error('Failed to find supply by name');
    }
  }
}
