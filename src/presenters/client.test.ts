import { ClientPresenter } from './client';
import { Client } from '../entities/client';

describe('ClientPresenter', () => {
  let presenter: ClientPresenter;

  beforeEach(() => {
    presenter = new ClientPresenter();
  });

  describe('present', () => {
    it('should present a created client correctly', () => {
      const client = new Client({
        name: 'João Silva',
        identifier: '11144477735'
      }, 1);

      presenter.present(client);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'João Silva',
          identifier: '11144477735'
        }
      });
    });

    it('should present a client without id', () => {
      const client = new Client({
        name: 'Maria Santos',
        identifier: '00000000191'
      });

      presenter.present(client);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: undefined,
          name: 'Maria Santos',
          identifier: '00000000191'
        }
      });
    });
  });

  describe('presentList', () => {
    it('should present a list of clients correctly', () => {
      const clients = [
        new Client({ name: 'João Silva', identifier: '11144477735' }, 1),
        new Client({ name: 'Maria Santos', identifier: '00000000191' }, 2)
      ];

      presenter.presentList(clients);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: 'João Silva',
            identifier: '11144477735'
          },
          {
            id: 2,
            name: 'Maria Santos',
            identifier: '00000000191'
          }
        ]
      });
    });

    it('should present an empty list correctly', () => {
      const clients: Client[] = [];

      presenter.presentList(clients);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: []
      });
    });
  });

  describe('presentFound', () => {
    it('should present a found client correctly', () => {
      const client = new Client({
        name: 'João Silva',
        identifier: '11144477735'
      }, 1);

      presenter.presentFound(client);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'João Silva',
          identifier: '11144477735'
        }
      });
    });
  });

  describe('presentUpdated', () => {
    it('should present an updated client correctly', () => {
      const client = new Client({
        name: 'João Silva Atualizado',
        identifier: '11144477735'
      }, 1);

      presenter.presentUpdated(client);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'João Silva Atualizado',
          identifier: '11144477735'
        }
      });
    });
  });

  describe('presentDeleted', () => {
    it('should present a deleted client correctly', () => {
      const client = new Client({
        name: 'João Silva',
        identifier: '11144477735'
      }, 1);

      presenter.presentDeleted(client);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        message: 'Cliente com ID 1 deletado com sucesso'
      });
    });

    it('should handle client without id in delete presentation', () => {
      const client = new Client({
        name: 'João Silva',
        identifier: '11144477735'
      });

      presenter.presentDeleted(client);

      expect(presenter.getStatusCode()).toBe(200);
      expect(presenter.getResponse()).toEqual({
        success: true,
        message: 'Cliente com ID undefined deletado com sucesso'
      });
    });
  });
});