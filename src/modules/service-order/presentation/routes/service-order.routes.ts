import express from 'express';
import { makeOSController } from '../../../../main/factories/service-order.factory';

const routerServiceOrders = express.Router();

const serviceController = makeOSController();

routerServiceOrders.post('/service-order', serviceController.create);
routerServiceOrders.get('/service-order', serviceController.find);
routerServiceOrders.get('/service-order/:id', serviceController.find);

routerServiceOrders.put('/service-order/:id/start-diagnosis', serviceController.startDiagnosis);
routerServiceOrders.put('/service-order/:id/update-diagnosis', serviceController.update);
routerServiceOrders.put('/service-order/:id/submit-approval', serviceController.submitForApproval);
routerServiceOrders.put('/service-order/:id/approve', serviceController.approve);
routerServiceOrders.put('/service-order/:id/start-execution', serviceController.startExecution);
routerServiceOrders.put('/service-order/:id/finalize', serviceController.finalize);
routerServiceOrders.put('/service-order/:id/deliver', serviceController.deliver);

routerServiceOrders.put('/service-order/:id/cancel', serviceController.cancel);

export default routerServiceOrders;
