import { Request, Response, NextFunction } from 'express';
import { ErrorHandler, errorHandler } from './error-handler';
import { ConflictError, NotFoundError, ValidationError } from '../../domain/errors/domain-errors';
import { BadRequestError } from '../../domain/errors/http-errors';

describe('ErrorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      url: '/test',
      method: 'GET',
      path: '/test'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handle', () => {
    it('should handle HttpError directly', () => {
      const httpError = new BadRequestError('Bad request');

      ErrorHandler.handle(httpError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: httpError.name,
          message: 'Bad request',
          statusCode: 400,
          timestamp: expect.any(String),
          path: '/test'
        }
      });
    });

    it('should convert ValidationError to HttpError', () => {
      const validationError = new ValidationError('Validation failed');

      ErrorHandler.handle(validationError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: 'Validation failed',
          statusCode: 400,
          timestamp: expect.any(String),
          path: '/test'
        }
      });
    });

    it('should convert NotFoundError to HttpError', () => {
      const notFoundError = new NotFoundError('Resource', '123');

      ErrorHandler.handle(notFoundError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: 'Resource with id 123 not found não encontrado',
          statusCode: 404,
          timestamp: expect.any(String),
          path: '/test'
        }
      });
    });

    it('should convert ConflictError to HttpError', () => {
      const conflictError = new ConflictError('Resource already exists');

      ErrorHandler.handle(conflictError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: 'Resource already exists',
          statusCode: 409,
          timestamp: expect.any(String),
          path: '/test'
        }
      });
    });

    it('should handle generic errors as Internal Server Error', () => {
      const genericError = new Error('Some unexpected error');

      ErrorHandler.handle(genericError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/test'
        }
      });
    });

    it('should log error details', () => {
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'error');

      ErrorHandler.handle(error, req as Request, res as Response, next);

      expect(consoleSpy).toHaveBeenCalledWith('Erro capturado pelo handler:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });
    });
  });

  describe('errorHandler middleware', () => {
    it('should call ErrorHandler.handle', () => {
      const error = new Error('Test error');
      const handleSpy = jest.spyOn(ErrorHandler, 'handle').mockImplementation(() => {});

      errorHandler(error, req as Request, res as Response, next);

      expect(handleSpy).toHaveBeenCalledWith(error, req, res, next);
    });
  });
});
