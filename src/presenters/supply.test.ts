import { SupplyPresenter } from './supply';
import { Supply } from '../entities/supply';

describe('SupplyPresenter', () => {
  let presenter: SupplyPresenter;

  beforeEach(() => {
    presenter = new SupplyPresenter();
  });

  describe('present', () => {
    it('should present a supply with status 201', () => {
      const supply = {
        id: 1,
        name: 'Filtro de óleo',
        quantity: 10,
        price: 25.50
      } as Supply;

      presenter.present(supply);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Filtro de óleo',
          quantity: 10,
          price: 25.5
        }
      });
    });

    it('should format price as number for present', () => {
      const supply = {
        id: 2,
        name: 'Filtro de ar',
        quantity: 5,
        price: 15.00
      } as Supply;

      presenter.present(supply);

      expect(presenter.getResponse().data.price).toBe(15);
      expect(typeof presenter.getResponse().data.price).toBe('number');
    });
  });

  describe('presentList', () => {
    it('should present list of supplies with status 200', () => {
      const supplies = [
        { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.50 } as Supply,
        { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.00 } as Supply
      ];

      presenter.presentList(supplies);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: 'Filtro de óleo',
            quantity: 10,
            price: 25.5
          },
          {
            id: 2,
            name: 'Filtro de ar',
            quantity: 5,
            price: 15
          }
        ]
      });
    });

    it('should present empty list', () => {
      presenter.presentList([]);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: []
      });
    });

    it('should format all prices as numbers in list', () => {
      const supplies = [
        { id: 1, name: 'Filtro de óleo', quantity: 10, price: 25.99 } as Supply,
        { id: 2, name: 'Filtro de ar', quantity: 5, price: 15.01 } as Supply
      ];

      presenter.presentList(supplies);

      const response = presenter.getResponse();
      expect(response.data[0].price).toBe(25.99);
      expect(response.data[1].price).toBe(15.01);
      expect(typeof response.data[0].price).toBe('number');
      expect(typeof response.data[1].price).toBe('number');
    });
  });

  describe('presentFound', () => {
    it('should present found supply with status 200', () => {
      const supply = {
        id: 3,
        name: 'Pastilha de freio',
        quantity: 8,
        price: 45.75
      } as Supply;

      presenter.presentFound(supply);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 3,
          name: 'Pastilha de freio',
          quantity: 8,
          price: 45.75
        }
      });
    });

    it('should format price as number for presentFound', () => {
      const supply = {
        id: 4,
        name: 'Óleo do motor',
        quantity: 20,
        price: 30.00
      } as Supply;

      presenter.presentFound(supply);

      expect(presenter.getResponse().data.price).toBe(30);
      expect(typeof presenter.getResponse().data.price).toBe('number');
    });
  });

  describe('presentUpdated', () => {
    it('should present updated supply with status 200', () => {
      const supply = {
        id: 5,
        name: 'Filtro de combustível',
        quantity: 12,
        price: 20.25
      } as Supply;

      presenter.presentUpdated(supply);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 5,
          name: 'Filtro de combustível',
          quantity: 12,
          price: 20.25
        }
      });
    });

    it('should format price as number for presentUpdated', () => {
      const supply = {
        id: 6,
        name: 'Vela de ignição',
        quantity: 16,
        price: 35.90
      } as Supply;

      presenter.presentUpdated(supply);

      expect(presenter.getResponse().data.price).toBe(35.9);
      expect(typeof presenter.getResponse().data.price).toBe('number');
    });
  });

  describe('presentDeleted', () => {
    it('should present deleted supply with status 200 and message', () => {
      const supply = {
        id: 7,
        name: 'Filtro de ar',
        quantity: 5,
        price: 15.00
      } as Supply;

      presenter.presentDeleted(supply);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        message: 'Insumo com ID 7 deletado com sucesso'
      });
    });

    it('should handle different supply ids in delete message', () => {
      const supply = {
        id: 999,
        name: 'Qualquer insumo',
        quantity: 1,
        price: 10.00
      } as Supply;

      presenter.presentDeleted(supply);

      expect(presenter.getResponse().message).toBe('Insumo com ID 999 deletado com sucesso');
    });
  });
});