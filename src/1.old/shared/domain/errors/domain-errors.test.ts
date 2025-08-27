import { ValidationError, NotFoundError, ConflictError } from './domain-errors';
import { BadRequestError, NotFoundHttpError, ConflictHttpError } from './http-errors';

describe('Domain Errors', () => {
  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should convert to BadRequestError', () => {
      const validationError = new ValidationError('Invalid input');
      const httpError = validationError.toHttpError();

      expect(httpError).toBeInstanceOf(BadRequestError);
      expect(httpError.message).toBe('Invalid input');
      expect(httpError.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with entity and id', () => {
      const error = new NotFoundError('User', '123');

      expect(error.message).toBe('User with id 123 not found');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should convert to NotFoundHttpError', () => {
      const notFoundError = new NotFoundError('Product', '456');
      const httpError = notFoundError.toHttpError();

      expect(httpError).toBeInstanceOf(NotFoundHttpError);
      expect(httpError.message).toBe('Product with id 456 not found não encontrado');
      expect(httpError.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with message', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should convert to ConflictHttpError', () => {
      const conflictError = new ConflictError('Email already in use');
      const httpError = conflictError.toHttpError();

      expect(httpError).toBeInstanceOf(ConflictHttpError);
      expect(httpError.message).toBe('Email already in use');
      expect(httpError.statusCode).toBe(409);
    });
  });
});
