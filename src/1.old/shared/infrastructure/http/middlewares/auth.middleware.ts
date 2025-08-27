import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenError, UnauthorizedError } from '../../../domain/errors/http-errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

interface JWTPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const blacklist = new Set<string>();

// Middleware principal de verificação JWT
const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.headers["authorization"];
    
    if (!token) {
      return next(new UnauthorizedError("Token não fornecido."));
    }

    token = token.replace("Bearer ", "");
    
    if (blacklist.has(token)) {
      return next(new ForbiddenError("Token inválido."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    
    if (!decoded) {
      return next(new ForbiddenError("Token inválido."));
    }

    // Adiciona as informações do usuário ao request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    return next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ForbiddenError("Token inválido."));
    }
    return next(new ForbiddenError((err as Error).message));
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Usuário não autenticado."));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(new ForbiddenError("Acesso negado. Apenas administradores."));
  }

  next();
};

const addToBlacklist = (token: string): void => {
  blacklist.add(token);
};

const clearBlacklist = (): void => {
  blacklist.clear();
};

export {
    addToBlacklist,
    clearBlacklist, requireAdmin, verifyJWT
};

export default verifyJWT;