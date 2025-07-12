import express from 'express';
import SupplyController from '../../controllers/domain/supply.controller';

const routerSupplies = express.Router();

routerSupplies.get('/supplies', SupplyController.read);
routerSupplies.get('/supplies/:id', SupplyController.read);

routerSupplies.post('/supplies', SupplyController.create);
routerSupplies.put('/supplies/:id', SupplyController.update);

routerSupplies.delete('/supplies/:id', SupplyController.delete);

export default routerSupplies;