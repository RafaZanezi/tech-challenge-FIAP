import express from 'express';
import { makeVehicleController } from '../../../../main/factories/vehicle-controller.factory';

const routerVehicles = express.Router();

const vehicleController = makeVehicleController();

routerVehicles.get('/vehicles', vehicleController.find);
routerVehicles.get('/vehicles/:id', vehicleController.find);
routerVehicles.post('/vehicles', vehicleController.create);
routerVehicles.put('/vehicles/:id', vehicleController.update);
routerVehicles.delete('/vehicles/:id', vehicleController.delete);

export default routerVehicles;
