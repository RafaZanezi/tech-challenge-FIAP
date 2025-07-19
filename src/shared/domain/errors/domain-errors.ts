import { BadRequestError, NotFoundHttpError, ConflictHttpError } from './http-errors';

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  toHttpError(): BadRequestError {
    return new BadRequestError(this.message);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }

  toHttpError(): NotFoundHttpError {
    return new NotFoundHttpError(this.message);
  }
}

export class ConflictError extends DomainError {
  toHttpError(): ConflictHttpError {
    return new ConflictHttpError(this.message);
  }
}
