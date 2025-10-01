import { ServicePresenter } from './service';
import { Service } from '../entities/service';

describe('ServicePresenter', () => {
  let presenter: ServicePresenter;

  beforeEach(() => {
    presenter = new ServicePresenter();
  });

  describe('present', () => {
    it('should present a created service correctly', () => {
      const service = new Service({
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.50
      }, 1);

      presenter.present(service);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Troca de óleo',
          description: 'Troca completa de óleo do motor',
          price: 80.50
        }
      });
    });

    it('should present a service without id', () => {
      const service = new Service({
        name: 'Alinhamento',
        description: 'Alinhamento das rodas',
        price: 60.00
      });

      presenter.present(service);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: undefined,
          name: 'Alinhamento',
          description: 'Alinhamento das rodas',
          price: 60.00
        }
      });
    });

    it('should handle integer prices correctly', () => {
      const service = new Service({
        name: 'Revisão',
        description: 'Revisão completa',
        price: 100
      }, 1);

      presenter.present(service);

      expect(presenter.getResponse().data.price).toBe(100);
    });
  });

  describe('presentList', () => {
    it('should present a list of services correctly', () => {
      const services = [
        new Service({
          name: 'Troca de óleo',
          description: 'Troca completa de óleo',
          price: 80.50
        }, 1),
        new Service({
          name: 'Alinhamento',
          description: 'Alinhamento das rodas',
          price: 60.00
        }, 2)
      ];

      presenter.presentList(services);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: 'Troca de óleo',
            description: 'Troca completa de óleo',
            price: 80.50
          },
          {
            id: 2,
            name: 'Alinhamento',
            description: 'Alinhamento das rodas',
            price: 60.00
          }
        ]
      });
    });

    it('should present an empty list correctly', () => {
      const services: Service[] = [];

      presenter.presentList(services);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: []
      });
    });
  });

  describe('presentFound', () => {
    it('should present a found service correctly', () => {
      const service = new Service({
        name: 'Troca de óleo',
        description: 'Troca completa de óleo do motor',
        price: 80.50
      }, 1);

      presenter.presentFound(service);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Troca de óleo',
          description: 'Troca completa de óleo do motor',
          price: 80.50
        }
      });
    });
  });

  describe('presentUpdated', () => {
    it('should present an updated service correctly', () => {
      const service = new Service({
        name: 'Troca de óleo premium',
        description: 'Troca completa de óleo sintético',
        price: 120.00
      }, 1);

      presenter.presentUpdated(service);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Troca de óleo premium',
          description: 'Troca completa de óleo sintético',
          price: 120.00
        }
      });
    });
  });

  describe('presentDeleted', () => {
    it('should present a deleted service correctly', () => {
      const service = new Service({
        name: 'Troca de óleo',
        description: 'Descrição',
        price: 80.00
      }, 1);

      presenter.presentDeleted(service);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        message: 'Serviço com ID 1 deletado com sucesso'
      });
    });

    it('should handle service without id in delete presentation', () => {
      const service = new Service({
        name: 'Troca de óleo',
        description: 'Descrição',
        price: 80.00
      });

      presenter.presentDeleted(service);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        message: 'Serviço com ID undefined deletado com sucesso'
      });
    });
  });
});