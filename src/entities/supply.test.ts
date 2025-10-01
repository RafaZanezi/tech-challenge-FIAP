import { Supply } from './supply';
import { ValidationError } from '../usecases/errors/errors';

describe('Supply Entity', () => {
  describe('constructor', () => {
    it('should create a supply with valid data', () => {
      const supplyData = {
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      };

      const supply = new Supply(supplyData, 1);

      expect(supply.id).toBe(1);
      expect(supply.name).toBe('Filtro de óleo');
      expect(supply.quantity).toBe(10);
      expect(supply.price).toBe(25.50);
    });

    it('should create a supply without id', () => {
      const supplyData = {
        name: 'Filtro de ar',
        quantity: 5,
        price: 15.00
      };

      const supply = new Supply(supplyData);

      expect(supply.id).toBeUndefined();
      expect(supply.name).toBe('Filtro de ar');
      expect(supply.quantity).toBe(5);
      expect(supply.price).toBe(15.00);
    });

    it('should accept zero quantity', () => {
      const supplyData = {
        name: 'Produto esgotado',
        quantity: 0,
        price: 10.00
      };

      expect(() => new Supply(supplyData)).not.toThrow();
    });

    it('should accept zero price', () => {
      const supplyData = {
        name: 'Produto gratuito',
        quantity: 1,
        price: 0
      };

      expect(() => new Supply(supplyData)).not.toThrow();
    });

    it('should throw error for empty name', () => {
      const supplyData = {
        name: '',
        quantity: 10,
        price: 25.50
      };

      expect(() => new Supply(supplyData)).toThrow(ValidationError);
      expect(() => new Supply(supplyData)).toThrow('Nome do insumo é obrigatório');
    });

    it('should throw error for missing name', () => {
      const supplyData = {
        name: null as any,
        quantity: 10,
        price: 25.50
      };

      expect(() => new Supply(supplyData)).toThrow(ValidationError);
      expect(() => new Supply(supplyData)).toThrow('Nome do insumo é obrigatório');
    });

    it('should throw error for negative quantity', () => {
      const supplyData = {
        name: 'Produto válido',
        quantity: -5,
        price: 25.50
      };

      expect(() => new Supply(supplyData)).toThrow(ValidationError);
      expect(() => new Supply(supplyData)).toThrow('Quantidade do insumo não pode ser negativa');
    });

    it('should throw error for negative price', () => {
      const supplyData = {
        name: 'Produto válido',
        quantity: 10,
        price: -15.50
      };

      expect(() => new Supply(supplyData)).toThrow(ValidationError);
      expect(() => new Supply(supplyData)).toThrow('Preço do insumo não pode ser negativo');
    });
  });

  describe('updateName', () => {
    let supply: Supply;

    beforeEach(() => {
      supply = new Supply({
        name: 'Nome original',
        quantity: 10,
        price: 25.50
      });
    });

    it('should update name with valid value', () => {
      supply.updateName('Novo nome');
      expect(supply.name).toBe('Novo nome');
    });

    it('should throw error for empty name', () => {
      expect(() => supply.updateName('')).toThrow(ValidationError);
      expect(() => supply.updateName('')).toThrow('Nome do insumo não pode estar vazio');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => supply.updateName('   ')).toThrow(ValidationError);
      expect(() => supply.updateName('   ')).toThrow('Nome do insumo não pode estar vazio');
    });

    it('should throw error for null name', () => {
      expect(() => supply.updateName(null as any)).toThrow(ValidationError);
      expect(() => supply.updateName(null as any)).toThrow('Nome do insumo não pode estar vazio');
    });
  });

  describe('updateQuantity', () => {
    let supply: Supply;

    beforeEach(() => {
      supply = new Supply({
        name: 'Nome original',
        quantity: 10,
        price: 25.50
      });
    });

    it('should update quantity with valid value', () => {
      supply.updateQuantity(20);
      expect(supply.quantity).toBe(20);
    });

    it('should allow zero quantity', () => {
      supply.updateQuantity(0);
      expect(supply.quantity).toBe(0);
    });

    it('should throw error for negative quantity', () => {
      expect(() => supply.updateQuantity(-5)).toThrow(ValidationError);
      expect(() => supply.updateQuantity(-5)).toThrow('Quantidade do insumo não pode ser negativa');
    });
  });

  describe('updatePrice', () => {
    let supply: Supply;

    beforeEach(() => {
      supply = new Supply({
        name: 'Nome original',
        quantity: 10,
        price: 25.50
      });
    });

    it('should update price with valid value', () => {
      supply.updatePrice(30.00);
      expect(supply.price).toBe(30.00);
    });

    it('should allow zero price', () => {
      supply.updatePrice(0);
      expect(supply.price).toBe(0);
    });

    it('should throw error for negative price', () => {
      expect(() => supply.updatePrice(-10)).toThrow(ValidationError);
      expect(() => supply.updatePrice(-10)).toThrow('Preço do insumo não pode ser negativo');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation with id', () => {
      const supply = new Supply({
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      }, 1);

      const json = supply.toJSON();

      expect(json).toEqual({
        id: 1,
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      });
    });

    it('should return correct JSON representation without id', () => {
      const supply = new Supply({
        name: 'Filtro de ar',
        quantity: 5,
        price: 15.00
      });

      const json = supply.toJSON();

      expect(json).toEqual({
        id: undefined,
        name: 'Filtro de ar',
        quantity: 5,
        price: 15.00
      });
    });
  });
});