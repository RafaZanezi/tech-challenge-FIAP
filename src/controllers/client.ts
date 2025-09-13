import { Client } from "../entities/client";
import { ClientGateway } from "../gateways/client";
import { DatabaseConnection } from "../interfaces/connection";
import { ClientGatewayInterface } from "../interfaces/gateways";
import { ClientCreatedPresenter } from "../presenters/client";
import { ErrorPresenter } from "../presenters/error";
import { ValidationErrorPresenter } from "../presenters/validation";
import { ClientUseCases } from "../usecases/client";
import { ValidationError } from "../usecases/errors/errors";

export class ClientController {

  private dbConnection: DatabaseConnection;
  private clientGateway: ClientGatewayInterface;
  private clientUseCase: ClientUseCases;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.clientGateway = new ClientGateway(this.dbConnection);
    this.clientUseCase = new ClientUseCases(this.clientGateway);
  }

  public create = async (req, res) => {
    try {
      const client = new Client({
        name: req.body.name,
        identifier: req.body.identifier
      });

      const newClient = await this.clientUseCase.createClient(client);

      const presenter = new ClientCreatedPresenter();
      presenter.present(newClient);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      let presenter;

      if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
      } else {
        presenter = new ErrorPresenter();
      }

      presenter.present(error);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.clientUseCase.updateClient(parseInt(req.params.id), req.body);

      const presenter = new ClientCreatedPresenter();
      presenter.present(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      let presenter;

      if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
      } else {
        presenter = new ErrorPresenter();
      }

      presenter.present(error);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    }
  }

  public find = async (req, res) => {
    try {
      const clientId = req.params.id;
      const presenter = new ClientCreatedPresenter();

      if (clientId) {
        const response = await this.clientUseCase.findClientById(clientId);

        presenter.present(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());
      }

      const response = await this.clientUseCase.findAllClients();

      presenter.present(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      let presenter;

      if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
      } else {
        presenter = new ErrorPresenter();
      }

      presenter.present(error);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    }
  }

  public delete = async (req, res) => {
    try {
      const clientId = req.params.id;
      await this.clientUseCase.deleteClient(clientId);

      const presenter = new ClientCreatedPresenter();
      presenter.present({ id: clientId });

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      let presenter;

      if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
      } else {
        presenter = new ErrorPresenter();
      }

      presenter.present(error);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    }
  }
}