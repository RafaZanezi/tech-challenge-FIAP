import { BasePresenter } from './base-presenter';

class TestPresenter extends BasePresenter {
  present(data: any): void {
    this.statusCode = 201;
    this.response = {
      success: true,
      data: data
    };
  }

  presentError(error: any): void {
    this.statusCode = 400;
    this.response = {
      success: false,
      error: error
    };
  }
}

describe('BasePresenter', () => {
  let presenter: TestPresenter;

  beforeEach(() => {
    presenter = new TestPresenter();
  });

  describe('initial state', () => {
    it('should have default status code 200', () => {
      expect(presenter.getStatusCode()).toBe(200);
    });

    it('should have empty response object', () => {
      expect(presenter.getResponse()).toEqual({});
    });
  });

  describe('getStatusCode', () => {
    it('should return current status code', () => {
      presenter.presentError('Test error');
      expect(presenter.getStatusCode()).toBe(400);
    });
  });

  describe('getResponse', () => {
    it('should return current response', () => {
      const testData = { id: 1, name: 'test' };
      presenter.present(testData);
      
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: testData
      });
    });
  });

  describe('present', () => {
    it('should set status code and response', () => {
      const testData = { id: 1, name: 'test' };
      presenter.present(testData);

      expect(presenter.getStatusCode()).toBe(201);
      expect(presenter.getResponse()).toEqual({
        success: true,
        data: testData
      });
    });
  });
});