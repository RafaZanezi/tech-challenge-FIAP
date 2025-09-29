import express from 'express';
import { AuthController } from '../controllers/auth';
import { DatabaseConnection } from '../interfaces/connection';
import { verifyJWT } from './middlewares';

export class AuthAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const authController = new AuthController(this._dbConnection);

    const routerAuth = express.Router();

    // Rotas públicas
    routerAuth.post('/auth/register', authController.register);
    routerAuth.post('/auth/login', authController.login);
    
    // Rotas protegidas
    routerAuth.post('/auth/logout', verifyJWT, authController.logout);
    routerAuth.get('/auth/profile', verifyJWT, authController.profile);

    return routerAuth;
  }
}