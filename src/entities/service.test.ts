import { Service } from './service';
import { ValidationError } from '../usecases/errors/errors';

describe('Service Entity', () => {
  describe('constructor', () => {
    it('should create a service with valid data', () => {
      const serviceData = {
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.00
      };

      const service = new Service(serviceData, 1);

      expect(service.id).toBe(1);
      expect(service.name).toBe('Troca de óleo');
      expect(service.description).toBe('Troca completa de óleo do motor');
      expect(service.price).toBe(80.00);
    });

    it('should create a service without id', () => {
      const serviceData = {
        name: 'Alinhamento',
        description: 'Alinhamento das rodas',
        price: 60.00
      };

      const service = new Service(serviceData);

      expect(service.id).toBeUndefined();
      expect(service.name).toBe('Alinhamento');
      expect(service.description).toBe('Alinhamento das rodas');
      expect(service.price).toBe(60.00);
    });

    it('should throw error for empty name', () => {
      const serviceData = {
        name: '',
        description: 'Descrição válida',
        price: 50.00
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Nome do serviço é obrigatório');
    });

    it('should throw error for missing name', () => {
      const serviceData = {
        name: null as any,
        description: 'Descrição válida',
        price: 50.00
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Nome do serviço é obrigatório');
    });

    it('should throw error for empty description', () => {
      const serviceData = {
        name: 'Nome válido',
        description: '',
        price: 50.00
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Descrição do serviço é obrigatória');
    });

    it('should throw error for missing description', () => {
      const serviceData = {
        name: 'Nome válido',
        description: null as any,
        price: 50.00
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Descrição do serviço é obrigatória');
    });

    it('should throw error for zero price', () => {
      const serviceData = {
        name: 'Nome válido',
        description: 'Descrição válida',
        price: 0
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Preço do serviço deve ser maior que zero');
    });

    it('should throw error for negative price', () => {
      const serviceData = {
        name: 'Nome válido',
        description: 'Descrição válida',
        price: -10
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Preço do serviço deve ser maior que zero');
    });

    it('should throw error for missing price', () => {
      const serviceData = {
        name: 'Nome válido',
        description: 'Descrição válida',
        price: null as any
      };

      expect(() => new Service(serviceData)).toThrow(ValidationError);
      expect(() => new Service(serviceData)).toThrow('Preço do serviço deve ser maior que zero');
    });
  });

  describe('updateName', () => {
    let service: Service;

    beforeEach(() => {
      service = new Service({
        name: 'Nome original',
        description: 'Descrição original',
        price: 100.00
      });
    });

    it('should update name with valid value', () => {
      service.updateName('Novo nome');
      expect(service.name).toBe('Novo nome');
    });

    it('should throw error for empty name', () => {
      expect(() => service.updateName('')).toThrow(ValidationError);
      expect(() => service.updateName('')).toThrow('Nome do serviço não pode estar vazio');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => service.updateName('   ')).toThrow(ValidationError);
      expect(() => service.updateName('   ')).toThrow('Nome do serviço não pode estar vazio');
    });

    it('should throw error for null name', () => {
      expect(() => service.updateName(null as any)).toThrow(ValidationError);
      expect(() => service.updateName(null as any)).toThrow('Nome do serviço não pode estar vazio');
    });
  });

  describe('updateDescription', () => {
    let service: Service;

    beforeEach(() => {
      service = new Service({
        name: 'Nome original',
        description: 'Descrição original',
        price: 100.00
      });
    });

    it('should update description with valid value', () => {
      service.updateDescription('Nova descrição');
      expect(service.description).toBe('Nova descrição');
    });

    it('should throw error for empty description', () => {
      expect(() => service.updateDescription('')).toThrow(ValidationError);
      expect(() => service.updateDescription('')).toThrow('Descrição do serviço não pode estar vazia');
    });

    it('should throw error for whitespace-only description', () => {
      expect(() => service.updateDescription('   ')).toThrow(ValidationError);
      expect(() => service.updateDescription('   ')).toThrow('Descrição do serviço não pode estar vazia');
    });

    it('should throw error for null description', () => {
      expect(() => service.updateDescription(null as any)).toThrow(ValidationError);
      expect(() => service.updateDescription(null as any)).toThrow('Descrição do serviço não pode estar vazia');
    });
  });

  describe('updatePrice', () => {
    let service: Service;

    beforeEach(() => {
      service = new Service({
        name: 'Nome original',
        description: 'Descrição original',
        price: 100.00
      });
    });

    it('should update price with valid value', () => {
      service.updatePrice(150.00);
      expect(service.price).toBe(150.00);
    });

    it('should throw error for zero price', () => {
      expect(() => service.updatePrice(0)).toThrow(ValidationError);
      expect(() => service.updatePrice(0)).toThrow('Preço do serviço deve ser maior que zero');
    });

    it('should throw error for negative price', () => {
      expect(() => service.updatePrice(-50)).toThrow(ValidationError);
      expect(() => service.updatePrice(-50)).toThrow('Preço do serviço deve ser maior que zero');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation with id', () => {
      const service = new Service({
        name: 'Troca de óleo',
        description: 'Serviço completo',
        price: 80.00
      }, 1);

      const json = service.toJSON();

      expect(json).toEqual({
        id: 1,
        name: 'Troca de óleo',
        description: 'Serviço completo',
        price: 80.00
      });
    });

    it('should return correct JSON representation without id', () => {
      const service = new Service({
        name: 'Alinhamento',
        description: 'Alinhamento das rodas',
        price: 60.00
      });

      const json = service.toJSON();

      expect(json).toEqual({
        id: undefined,
        name: 'Alinhamento',
        description: 'Alinhamento das rodas',
        price: 60.00
      });
    });
  });
});