import { NextFunction, Request, Response } from 'express';
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/domain/errors/domain-errors';
import { HttpError } from '../../../shared/domain/errors/http-error';
import { InternalServerError } from '../../../shared/domain/errors/http-errors';

export interface ErrorResponse {
  error: {
    name: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: any;
  };
}

export class ErrorHandler {
  public static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error caught by handler:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });

    // Se já é um HttpError, use diretamente
    if (error instanceof HttpError) {
      ErrorHandler.sendErrorResponse(res, error, req.path);
      return;
    }

    // Converter erros de domínio para HTTP errors
    if (error instanceof ValidationError) {
      const httpError = error.toHttpError();
      ErrorHandler.sendErrorResponse(res, httpError, req.path);
      return;
    }

    if (error instanceof NotFoundError) {
      const httpError = error.toHttpError();
      ErrorHandler.sendErrorResponse(res, httpError, req.path);
      return;
    }

    if (error instanceof ConflictError) {
      const httpError = error.toHttpError();
      ErrorHandler.sendErrorResponse(res, httpError, req.path);
      return;
    }

    // Erro genérico - Internal Server Error
    const genericError = new InternalServerError();
    ErrorHandler.sendErrorResponse(res, genericError, req.path);
  }

  private static sendErrorResponse(res: Response, error: HttpError, path: string): void {
    const errorResponse: ErrorResponse = {
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        path
      }
    };

    res.status(error.statusCode).json(errorResponse);
  }
}

// Middleware function
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  ErrorHandler.handle(error, req, res, next);
};
