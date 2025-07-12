import express from 'express';
import ServiceOrderController from '../../controllers/domain/service-order.controller';

const routerServiceOrders = express.Router();

routerServiceOrders.post('/service-order', ServiceOrderController.create);
routerServiceOrders.get('/service-order', ServiceOrderController.read);

routerServiceOrders.post('service-order/:id/start-diagnosis', ServiceOrderController.startDiagnosis);
routerServiceOrders.post('service-order/:id/update-services', ServiceOrderController.update);
routerServiceOrders.post('service-order/:id/submit-approval', ServiceOrderController.submitForApproval);
routerServiceOrders.post('service-order/:id/approve', ServiceOrderController.approve);
routerServiceOrders.post('service-order/:id/start-execution', ServiceOrderController.startExecution);
routerServiceOrders.post('service-order/:id/finalize', ServiceOrderController.finalize);
routerServiceOrders.post('service-order/:id/deliver', ServiceOrderController.deliver);

routerServiceOrders.post('service-order/:id/cancel', ServiceOrderController.cancel);

export default routerServiceOrders;