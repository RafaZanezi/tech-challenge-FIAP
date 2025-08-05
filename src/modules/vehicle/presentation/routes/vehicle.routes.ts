import express from 'express';
import { makeVehicleController } from '../../../../main/factories/vehicle-controller.factory';
import { requireAdmin, verifyJWT } from '../../../../shared/infrastructure/http/middlewares';

const routerVehicles = express.Router();

const vehicleController = makeVehicleController();

routerVehicles.get('/vehicles', verifyJWT, requireAdmin, vehicleController.find);
routerVehicles.get('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.find);
routerVehicles.post('/vehicles', verifyJWT, requireAdmin, vehicleController.create);
routerVehicles.put('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.update);
routerVehicles.delete('/vehicles/:id', verifyJWT, requireAdmin, vehicleController.delete);

export default routerVehicles;
