import { ClientGateway } from "../gateways/client";
import { DatabaseConnection } from "../interfaces/connection";
import { ClientGatewayInterface } from "../interfaces/gateways";
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
      const client = await this.clientUseCase.createClient(req.body);

      res.status(201).json({
        success: true,
        data: client
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.clientUseCase.updateClient(parseInt(req.params.id), req.body);

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }

  public find = async (req, res) => {
    try {
      const clientId = req.params.id;

      if (clientId) {
        const response = await this.clientUseCase.findClientById(clientId);
        return res.status(200).json({
          success: true,
          data: response
        });
      }

      const response = await this.clientUseCase.findAllClients();

      return res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }

  public delete = async (req, res) => {
    try {
      const clientId = req.params.id;
      await this.clientUseCase.deleteClient(clientId);

      res.status(200).json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }
}