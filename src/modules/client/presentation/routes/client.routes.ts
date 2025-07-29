import express from 'express';
import { makeClientController } from '../../../../main/factories/client-controller.factory';

const routerClients = express.Router();

const clientController = makeClientController();

routerClients.get('/clients', clientController.find);
routerClients.get('/clients/:id', clientController.find);
routerClients.post('/clients', clientController.create);
routerClients.put('/clients/:id', clientController.update);
routerClients.delete('/clients/:id', clientController.delete);

export default routerClients;
