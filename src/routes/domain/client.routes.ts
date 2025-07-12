import express from 'express';
import ClientController from '../../controllers/domain/client.controller';

const routerClients = express.Router();

routerClients.get('/clientes', ClientController.read);
routerClients.get('/clientes/:id', ClientController.read);

routerClients.post('/clientes', ClientController.create);
routerClients.put('/clientes/:id', ClientController.update);

routerClients.delete('/clientes/:id', ClientController.delete);

export default routerClients;