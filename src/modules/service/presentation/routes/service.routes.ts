import express from 'express';
import { makeServiceController } from '../../../../main/factories/service-controller.factory';
import { requireAdmin, verifyJWT } from '../../../../shared/infrastructure/http/middlewares';

const routerServices = express.Router();

const serviceController = makeServiceController();

routerServices.get('/services', verifyJWT, requireAdmin, serviceController.find);
routerServices.get('/services/:id', verifyJWT, requireAdmin, serviceController.find);
routerServices.post('/services', verifyJWT, requireAdmin, serviceController.create);
routerServices.put('/services/:id', verifyJWT, requireAdmin, serviceController.update);
routerServices.delete('/services/:id', verifyJWT, requireAdmin, serviceController.delete);

export default routerServices;
