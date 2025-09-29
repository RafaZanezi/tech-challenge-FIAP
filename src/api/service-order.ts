import express from 'express';
import { ServiceOrderController } from '../controllers/service-order';
import { DatabaseConnection } from '../interfaces/connection';
import { requireAdmin, verifyJWT } from './middlewares';

export class ServiceOrderAPI {
  private _dbConnection: DatabaseConnection;

  constructor(dbConnection: DatabaseConnection) {
    this._dbConnection = dbConnection;
  }

  getRoutes() {
    const serviceOrderController = new ServiceOrderController(this._dbConnection);

    const routerServiceOrders = express.Router();

    // CRUD básico
    routerServiceOrders.get('/service-orders', serviceOrderController.find);
    routerServiceOrders.get('/service-orders/:id', serviceOrderController.find);
    routerServiceOrders.post('/service-orders', serviceOrderController.create);
    routerServiceOrders.put('/service-orders/:id', serviceOrderController.update);
    routerServiceOrders.delete('/service-orders/:id', serviceOrderController.delete);

    // Fluxo específico da ordem de serviço
    routerServiceOrders.patch('/service-orders/:id/start-diagnosis', serviceOrderController.startDiagnosis);
    routerServiceOrders.patch('/service-orders/:id/update-services-supplies', serviceOrderController.updateServicesAndSupplies);
    routerServiceOrders.patch('/service-orders/:id/submit-approval', serviceOrderController.submitForApproval);
    routerServiceOrders.patch('/service-orders/:id/approve', serviceOrderController.approveOrder);
    routerServiceOrders.patch('/service-orders/:id/start-execution', serviceOrderController.startExecution);
    routerServiceOrders.patch('/service-orders/:id/finalize', serviceOrderController.finalizeOrder);
    routerServiceOrders.patch('/service-orders/:id/deliver', serviceOrderController.deliverOrder);
    routerServiceOrders.patch('/service-orders/:id/cancel', serviceOrderController.cancelOrder);

    return routerServiceOrders;
  }

}
