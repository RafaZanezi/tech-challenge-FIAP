import express from 'express';
import { makeSupplyController } from '../../../../main/factories/supply-controller.factory';

const routerSupplies = express.Router();

const supplyController = makeSupplyController();

routerSupplies.get('/supplies', supplyController.find);
routerSupplies.get('/supplies/:id', supplyController.find);
routerSupplies.post('/supplies', supplyController.create);
routerSupplies.put('/supplies/:id', supplyController.update);
routerSupplies.delete('/supplies/:id', supplyController.delete);

export default routerSupplies;
