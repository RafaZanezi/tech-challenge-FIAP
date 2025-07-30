import express from 'express';
import { makeServiceController } from '../../../../main/factories/service-controller.factory';

const routerServices = express.Router();

const serviceController = makeServiceController();

routerServices.get('/services', serviceController.find);
routerServices.get('/services/:id', serviceController.find);
routerServices.post('/services', serviceController.create);
routerServices.put('/services/:id', serviceController.update);
routerServices.delete('/services/:id', serviceController.delete);

export default routerServices;
