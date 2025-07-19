import { HttpError } from './http-error';

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(resource?: string) {
    const message = resource ? `${resource} not found` : 'Resource not found';
    super(message, 404);
  }
}

export class ConflictHttpError extends HttpError {
  constructor(message = 'Conflict - Resource already exists') {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service Unavailable') {
    super(message, 503);
  }
}
