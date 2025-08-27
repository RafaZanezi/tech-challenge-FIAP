import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyJWT, requireAdmin, addToBlacklist, clearBlacklist, AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenError, UnauthorizedError } from '../../../domain/errors/http-errors';

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();

    // Clear blacklist before each test
    clearBlacklist();
    
    jest.clearAllMocks();
  });

  describe('verifyJWT', () => {
    it('should call next with UnauthorizedError when no token provided', () => {
      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with ForbiddenError when token is blacklisted', () => {
      const token = 'blacklisted-token';
      req.headers = { authorization: `Bearer ${token}` };
      addToBlacklist(token);

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with ForbiddenError when token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should set user in request when token is valid', () => {
      const token = 'valid-token';
      const payload = { id: '123', role: UserRole.ADMIN };
      
      req.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(req.user).toEqual({
        id: '123',
        role: UserRole.ADMIN
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle token without Bearer prefix', () => {
      const token = 'valid-token';
      const payload = { id: '123', role: UserRole.MECHANIC };
      
      req.headers = { authorization: token };
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(req.user).toEqual({
        id: '123',
        role: UserRole.MECHANIC
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError when decoded token is falsy', () => {
      req.headers = { authorization: 'Bearer token' };
      (jwt.verify as jest.Mock).mockReturnValue(null);

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should handle generic errors', () => {
      req.headers = { authorization: 'Bearer token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Some error');
      });

      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requireAdmin', () => {
    it('should call next with UnauthorizedError when user is not set', () => {
      requireAdmin(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with ForbiddenError when user is not admin', () => {
      req.user = { id: '123', role: UserRole.MECHANIC };

      requireAdmin(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next without error when user is admin', () => {
      req.user = { id: '123', role: UserRole.ADMIN };

      requireAdmin(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('blacklist functions', () => {
    it('should add token to blacklist', () => {
      const token = 'test-token';
      req.headers = { authorization: `Bearer ${token}` };
      
      addToBlacklist(token);
      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should clear blacklist', () => {
      const token = 'test-token';
      const payload = { id: '123', role: UserRole.MECHANIC };
      
      addToBlacklist(token);
      clearBlacklist();
      
      req.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue(payload);
      
      verifyJWT(req as AuthenticatedRequest, res as Response, next);

      expect(req.user).toEqual({
        id: '123',
        role: UserRole.MECHANIC
      });
      expect(next).toHaveBeenCalledWith();
    });
  });
});
