import { BadRequestError, ConflictHttpError, NotFoundHttpError } from './http-errors';

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  public toHttpError(): BadRequestError {
    return new BadRequestError(this.message);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }

  public toHttpError(): NotFoundHttpError {
    return new NotFoundHttpError(this.message);
  }
}

export class ConflictError extends DomainError {
  public toHttpError(): ConflictHttpError {
    return new ConflictHttpError(this.message);
  }
}
