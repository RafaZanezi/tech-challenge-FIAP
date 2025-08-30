import express from 'express';
import { ServiceController } from '../controllers/service';
import { DatabaseConnection } from '../interfaces/connection';
import { requireAdmin, verifyJWT } from './middlewares';

export class ServiceAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const serviceController = new ServiceController(this._dbConnection);

    const routerServices = express.Router();

    routerServices.get('/services', serviceController.find);
    routerServices.get('/services/:id', serviceController.find);
    routerServices.post('/services', serviceController.create);
    routerServices.put('/services/:id', serviceController.update);
    routerServices.delete('/services/:id', serviceController.delete);
    // routerServices.get('/services', verifyJWT, requireAdmin, serviceController.find);
    // routerServices.get('/services/:id', verifyJWT, requireAdmin, serviceController.find);
    // routerServices.post('/services', verifyJWT, requireAdmin, serviceController.create);
    // routerServices.put('/services/:id', verifyJWT, requireAdmin, serviceController.update);
    // routerServices.delete('/services/:id', verifyJWT, requireAdmin, serviceController.delete);

    return routerServices;
  }
}
