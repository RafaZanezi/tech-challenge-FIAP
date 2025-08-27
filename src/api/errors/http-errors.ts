export abstract class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString()
    };
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Requisição Inválida') {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Não Autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Proibido') {
    super(message, 403);
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(resource?: string) {
    const message = resource ? `${resource} não encontrado` : 'Recurso não encontrado';
    super(message, 404);
  }
}

export class ConflictHttpError extends HttpError {
  constructor(message = 'Conflito - Recurso já existe') {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Entidade Não Processável') {
    super(message, 422);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Erro Interno do Servidor') {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Serviço Indisponível') {
    super(message, 503);
  }
}
