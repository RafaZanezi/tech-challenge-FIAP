import express from 'express';
import { makeSupplyController } from '../../../../main/factories/supply-controller.factory';
import { requireAdmin, verifyJWT } from '../../../../shared/infrastructure/http/middlewares';

const routerSupplies = express.Router();

const supplyController = makeSupplyController();

routerSupplies.get('/supplies', verifyJWT, requireAdmin, supplyController.find);
routerSupplies.get('/supplies/:id', verifyJWT, requireAdmin, supplyController.find);
routerSupplies.post('/supplies', verifyJWT, requireAdmin, supplyController.create);
routerSupplies.put('/supplies/:id', verifyJWT, requireAdmin, supplyController.update);
routerSupplies.delete('/supplies/:id', verifyJWT, requireAdmin, supplyController.delete);

export default routerSupplies;
