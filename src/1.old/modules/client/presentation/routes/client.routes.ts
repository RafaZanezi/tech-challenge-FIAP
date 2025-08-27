import express from 'express';
import { makeClientController } from '../../../../main/factories/client-controller.factory';
import { requireAdmin, verifyJWT } from '../../../../shared/infrastructure/http/middlewares';

const routerClients = express.Router();

const clientController = makeClientController();

routerClients.get('/clients', verifyJWT, requireAdmin, clientController.find);
routerClients.get('/clients/:id', verifyJWT, requireAdmin, clientController.find);
routerClients.post('/clients', verifyJWT, requireAdmin, clientController.create);
routerClients.put('/clients/:id', verifyJWT, requireAdmin, clientController.update);
routerClients.delete('/clients/:id', verifyJWT, requireAdmin, clientController.delete);

export default routerClients;
