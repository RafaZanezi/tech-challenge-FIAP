import { ServiceOrderDTO } from "../dtos/service-order";
import { ServiceOrderGateway } from "../gateways/service-order";
import { ClientGateway } from "../gateways/client";
import { VehicleGateway } from "../gateways/vehicle";
import { DatabaseConnection } from "../interfaces/connection";
import { ServiceOrderGatewayInterface, ClientGatewayInterface, VehicleGatewayInterface } from "../interfaces/gateways";
import { ServiceOrderPresenter } from "../presenters/service-order";
import { verifyAndReturnError } from "../presenters/verify-and-return-error";
import { ServiceOrderUseCases } from "../usecases/service-order";

export class ServiceOrderController {

  private dbConnection: DatabaseConnection;
  private serviceOrderGateway: ServiceOrderGatewayInterface;
  private clientGateway: ClientGatewayInterface;
  private vehicleGateway: VehicleGatewayInterface;
  private serviceOrderUseCase: ServiceOrderUseCases;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.serviceOrderGateway = new ServiceOrderGateway(this.dbConnection);
    this.clientGateway = new ClientGateway(this.dbConnection);
    this.vehicleGateway = new VehicleGateway(this.dbConnection);
    this.serviceOrderUseCase = new ServiceOrderUseCases(
      this.serviceOrderGateway, 
      this.clientGateway, 
      this.vehicleGateway
    );
  }

  public create = async (req, res) => {
    try {
      const serviceOrder = await this.serviceOrderUseCase.createServiceOrder(req.body);

      const presenter = new ServiceOrderPresenter();
      presenter.present(serviceOrder);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.serviceOrderUseCase.updateServiceOrder(
        parseInt(req.params.id),
        req.body
      );

      const presenter = new ServiceOrderPresenter();

      presenter.present(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public find = async (req, res) => {
    try {
      const serviceOrderId = req.params.id;
      const presenter = new ServiceOrderPresenter();

      if (serviceOrderId) {
        const response = await this.serviceOrderUseCase.findServiceOrderById(
          parseInt(serviceOrderId)
        );

        presenter.present(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());

        return;
      }

      const response = await this.serviceOrderUseCase.findAllServiceOrders();

      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public findActiveWithOrdering = async (req, res) => {
    try {
      const response = await this.serviceOrderUseCase.findActiveServiceOrdersWithOrdering();

      const presenter = new ServiceOrderPresenter();
      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public getStatus = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.getServiceOrderStatus(serviceOrderId);

      res.status(200).json(response);
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public externalApproval = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const { approved } = req.body;

      if (typeof approved !== 'boolean') {
        return res.status(400).json({ 
          error: 'O campo "approved" é obrigatório e deve ser um booleano' 
        });
      }

      const response = await this.serviceOrderUseCase.approveOrderFromExternal(
        serviceOrderId, 
        approved
      );

      const presenter = new ServiceOrderPresenter();
      presenter.presentUpdate(response); // Use presentUpdate instead of present
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public delete = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      await this.serviceOrderUseCase.deleteServiceOrder(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.present({ id: serviceOrderId } as ServiceOrderDTO);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public startDiagnosis = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.startDiagnosis(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.presentUpdate(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public updateServicesAndSupplies = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const { services, supplies } = req.body;

      const response = await this.serviceOrderUseCase.updateServicesAndSupplies(
        serviceOrderId,
        services,
        supplies
      );

      const presenter = new ServiceOrderPresenter();

      presenter.present(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public submitForApproval = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.submitForApproval(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.presentUpdate(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public approveOrder = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.approveOrder(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.present(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public startExecution = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.startExecution(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.presentUpdate(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public finalizeOrder = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.finalizeOrder(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.presentUpdate(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public deliverOrder = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.deliverOrder(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.presentUpdate(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public cancelOrder = async (req, res) => {
    try {
      const serviceOrderId = parseInt(req.params.id);
      const response = await this.serviceOrderUseCase.cancelOrder(serviceOrderId);

      const presenter = new ServiceOrderPresenter();

      presenter.present(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }
}