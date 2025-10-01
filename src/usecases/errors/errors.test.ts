import { BadRequestError, ConflictHttpError, NotFoundHttpError } from '../../api/errors/http-errors';
import { ConflictError, DomainError, NotFoundError, ValidationError } from './errors';

describe('Domain Errors', () => {
  describe('DomainError', () => {
    class TestDomainError extends DomainError {
      constructor(message: string) {
        super(message);
      }
    }

    it('should create domain error with message and correct name', () => {
      const error = new TestDomainError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('TestDomainError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should be abstract and extensible', () => {
      const error = new TestDomainError('Custom domain error');
      
      expect(error.constructor.name).toBe('TestDomainError');
      expect(error instanceof DomainError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should convert to BadRequestError', () => {
      const validationError = new ValidationError('Invalid input');
      const httpError = validationError.toHttpError();

      expect(httpError).toBeInstanceOf(BadRequestError);
      expect(httpError.message).toBe('Invalid input');
      expect(httpError.statusCode).toBe(400);
    });

    it('should handle empty message', () => {
      const error = new ValidationError('');
      const httpError = error.toHttpError();

      expect(error.message).toBe('');
      expect(httpError.message).toBe('');
    });

    it('should handle special characters in message', () => {
      const message = 'Validation failed: "field" is required & must be unique!';
      const error = new ValidationError(message);
      const httpError = error.toHttpError();

      expect(error.message).toBe(message);
      expect(httpError.message).toBe(message);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with entity and id', () => {
      const error = new NotFoundError('User', '123');

      expect(error.message).toBe('User with id 123 not found');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should convert to NotFoundHttpError', () => {
      const notFoundError = new NotFoundError('Product', '456');
      const httpError = notFoundError.toHttpError();

      expect(httpError).toBeInstanceOf(NotFoundHttpError);
      expect(httpError.message).toBe('Product with id 456 not found não encontrado');
      expect(httpError.statusCode).toBe(404);
    });

    it('should handle different entity types', () => {
      const userError = new NotFoundError('User', '1');
      const productError = new NotFoundError('Product', 'abc-123');
      const orderError = new NotFoundError('ServiceOrder', '999');

      expect(userError.message).toBe('User with id 1 not found');
      expect(productError.message).toBe('Product with id abc-123 not found');
      expect(orderError.message).toBe('ServiceOrder with id 999 not found');
    });

    it('should handle empty entity and id', () => {
      const error = new NotFoundError('', '');
      
      expect(error.message).toBe(' with id  not found');
    });

    it('should handle numeric id as string', () => {
      const numericId = 12345;
      const error = new NotFoundError('Entity', numericId.toString());
      
      expect(error.message).toBe('Entity with id 12345 not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with message', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should convert to ConflictHttpError', () => {
      const conflictError = new ConflictError('Email already in use');
      const httpError = conflictError.toHttpError();

      expect(httpError).toBeInstanceOf(ConflictHttpError);
      expect(httpError.message).toBe('Email already in use');
      expect(httpError.statusCode).toBe(409);
    });

    it('should handle duplicate key conflicts', () => {
      const error = new ConflictError('Duplicate entry for key "email"');
      const httpError = error.toHttpError();

      expect(error.message).toBe('Duplicate entry for key "email"');
      expect(httpError.message).toBe('Duplicate entry for key "email"');
    });

    it('should handle resource state conflicts', () => {
      const error = new ConflictError('Cannot delete resource: it is in use');
      const httpError = error.toHttpError();

      expect(error.message).toBe('Cannot delete resource: it is in use');
      expect(httpError.message).toBe('Cannot delete resource: it is in use');
    });

    it('should handle empty message', () => {
      const error = new ConflictError('');
      const httpError = error.toHttpError();

      expect(error.message).toBe('');
      expect(httpError.message).toBe('');
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper inheritance hierarchy', () => {
      const validationError = new ValidationError('test');
      const notFoundError = new NotFoundError('Entity', '1');
      const conflictError = new ConflictError('test');

      // All should be instances of DomainError
      expect(validationError instanceof DomainError).toBe(true);
      expect(notFoundError instanceof DomainError).toBe(true);
      expect(conflictError instanceof DomainError).toBe(true);

      // All should be instances of Error
      expect(validationError instanceof Error).toBe(true);
      expect(notFoundError instanceof Error).toBe(true);
      expect(conflictError instanceof Error).toBe(true);

      // Should have correct constructors
      expect(validationError.constructor.name).toBe('ValidationError');
      expect(notFoundError.constructor.name).toBe('NotFoundError');
      expect(conflictError.constructor.name).toBe('ConflictError');
    });

    it('should have stack traces', () => {
      const error = new ValidationError('test error');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
      expect(error.stack).toContain('test error');
    });
  });
});
