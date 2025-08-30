import express from 'express';
import { VehicleController } from '../controllers/vehicle';
import { DatabaseConnection } from '../interfaces/connection';
import { requireAdmin, verifyJWT } from './middlewares';

export class VehicleAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const vehicleController = new VehicleController(this._dbConnection);

    const routerVehicles = express.Router();

    routerVehicles.get('/vehicles', vehicleController.find);
    routerVehicles.get('/vehicles/:id', vehicleController.find);
    routerVehicles.get('/vehicles/client/:clientId', vehicleController.findByClient);
    routerVehicles.post('/vehicles', vehicleController.create);
    routerVehicles.put('/vehicles/:id', vehicleController.update);
    routerVehicles.delete('/vehicles/:id', vehicleController.delete);
    // routerVehicles.get('/vehicles', verifyJWT, requireAdmin, vehicleController.find);
    // routerVehicles.get('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.find);
    // routerVehicles.get('/vehicles/client/:clientId', verifyJWT, requireAdmin, vehicleController.findByClient);
    // routerVehicles.post('/vehicles', verifyJWT, requireAdmin, vehicleController.create);
    // routerVehicles.put('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.update);
    // routerVehicles.delete('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.delete);

    return routerVehicles;
  }
}
