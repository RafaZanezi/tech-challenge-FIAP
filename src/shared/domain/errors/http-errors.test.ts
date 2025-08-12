import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundHttpError,
  ConflictHttpError,
  UnprocessableEntityError,
  InternalServerError,
  ServiceUnavailableError
} from './http-errors';
import { HttpError } from './http-error';

describe('HTTP Errors', () => {
  describe('BadRequestError', () => {
    it('should create with default message', () => {
      const error = new BadRequestError();

      expect(error.message).toBe('Requisição Inválida');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new BadRequestError('Invalid data');

      expect(error.message).toBe('Invalid data');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create with default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Não Autorizado');
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Proibido');
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundHttpError', () => {
    it('should create with default message', () => {
      const error = new NotFoundHttpError();

      expect(error.message).toBe('Recurso não encontrado');
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with resource name', () => {
      const error = new NotFoundHttpError('User');

      expect(error.message).toBe('User não encontrado');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictHttpError', () => {
    it('should create with default message', () => {
      const error = new ConflictHttpError();

      expect(error.message).toBe('Conflito - Recurso já existe');
      expect(error.statusCode).toBe(409);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new ConflictHttpError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create with default message', () => {
      const error = new UnprocessableEntityError();

      expect(error.message).toBe('Entidade Não Processável');
      expect(error.statusCode).toBe(422);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new UnprocessableEntityError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
    });
  });

  describe('InternalServerError', () => {
    it('should create with default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Erro Interno do Servidor');
      expect(error.statusCode).toBe(500);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create with default message', () => {
      const error = new ServiceUnavailableError();

      expect(error.message).toBe('Serviço Indisponível');
      expect(error.statusCode).toBe(503);
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create with custom message', () => {
      const error = new ServiceUnavailableError('Service is down');

      expect(error.message).toBe('Service is down');
      expect(error.statusCode).toBe(503);
    });
  });
});
