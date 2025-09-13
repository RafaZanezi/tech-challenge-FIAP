import { Service } from "../entities/service";
import { ServiceGateway } from "../gateways/service";
import { DatabaseConnection } from "../interfaces/connection";
import { ServiceGatewayInterface } from "../interfaces/gateways";
import { ServiceCreatedPresenter } from "../presenters/service";
import { verifyAndReturnError } from "../shared/controller-presenter-error";
import { ServiceUseCases } from "../usecases/service";

export class ServiceController {

  private dbConnection: DatabaseConnection;
  private serviceGateway: ServiceGatewayInterface;
  private serviceUseCase: ServiceUseCases;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.serviceGateway = new ServiceGateway(this.dbConnection);
    this.serviceUseCase = new ServiceUseCases(this.serviceGateway);
  }

  public create = async (req, res) => {
    try {
      const service = new Service({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
      });

      const newService = await this.serviceUseCase.createService(service);

      const presenter = new ServiceCreatedPresenter();
      presenter.present(newService);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.serviceUseCase.updateService(parseInt(req.params.id), req.body);

      const presenter = new ServiceCreatedPresenter();
      presenter.present(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public find = async (req, res) => {
    try {
      const serviceId = req.params.id;
      const presenter = new ServiceCreatedPresenter();

      if (serviceId) {
        const response = await this.serviceUseCase.findServiceById(serviceId);

        presenter.present(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());

        return;
      }

      const response = await this.serviceUseCase.findAllServices();

      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public delete = async (req, res) => {
    try {
      const serviceId = req.params.id;
      await this.serviceUseCase.deleteService(serviceId);

      const presenter = new ServiceCreatedPresenter();
      presenter.present({ id: parseInt(serviceId) } as Service);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }
}