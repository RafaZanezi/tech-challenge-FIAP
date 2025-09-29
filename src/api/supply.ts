import express from 'express';
import { SupplyController } from '../controllers/supply';
import { DatabaseConnection } from '../interfaces/connection';
import { requireAdmin, verifyJWT } from './middlewares';

export class SupplyAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const supplyController = new SupplyController(this._dbConnection);

    const routerSupplies = express.Router();

    routerSupplies.get('/supplies', verifyJWT, requireAdmin, supplyController.find);
    routerSupplies.get('/supplies/:id', verifyJWT, requireAdmin, supplyController.find);
    routerSupplies.post('/supplies', verifyJWT, requireAdmin, supplyController.create);
    routerSupplies.put('/supplies/:id', verifyJWT, requireAdmin, supplyController.update);
    routerSupplies.delete('/supplies/:id', verifyJWT, requireAdmin, supplyController.delete);

    return routerSupplies;
  }
}
