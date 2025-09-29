import { Client } from "../entities/client";
import { ClientGateway } from "../gateways/client";
import { DatabaseConnection } from "../interfaces/connection";
import { ClientGatewayInterface } from "../interfaces/gateways";
import { ClientPresenter } from "../presenters/client";
import { verifyAndReturnError } from "../presenters/verify-and-return-error";
import { ClientUseCases } from "../usecases/client";

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

      const presenter = new ClientPresenter();
      presenter.present(newClient);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.clientUseCase.updateClient(parseInt(req.params.id), req.body);

      const presenter = new ClientPresenter();
      presenter.presentUpdated(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public find = async (req, res) => {
    try {
      const clientId = req.params.id;
      const presenter = new ClientPresenter();

      if (clientId) {
        const response = await this.clientUseCase.findClientById(clientId);

        presenter.presentFound(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());

        return;
      }

      const response = await this.clientUseCase.findAllClients();

      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public delete = async (req, res) => {
    try {
      const clientId = req.params.id;
      await this.clientUseCase.deleteClient(clientId);

      const presenter = new ClientPresenter();
      presenter.presentDeleted({ id: parseInt(clientId) } as Client);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }
}