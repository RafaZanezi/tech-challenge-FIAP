import express from 'express';
import { ClientController } from '../controllers/client';
import { DatabaseConnection } from '../interfaces/connection';
import { requireAdmin, verifyJWT } from './middlewares';

export class ClientAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const clientController = new ClientController(this._dbConnection);

    const routerClients = express.Router();
    
    routerClients.get('/clients', verifyJWT, requireAdmin, clientController.find);
    routerClients.get('/clients/:id', verifyJWT, requireAdmin, clientController.find);
    routerClients.post('/clients', verifyJWT, requireAdmin, clientController.create);
    routerClients.put('/clients/:id', verifyJWT, requireAdmin, clientController.update);
    routerClients.delete('/clients/:id', verifyJWT, requireAdmin, clientController.delete);

    return routerClients;
  }

}

