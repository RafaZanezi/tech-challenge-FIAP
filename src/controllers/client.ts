import { ClientGateway } from "../gateways/client";
import { DatabaseConnection } from "../interfaces/connection";
import { ClientGatewayInterface } from "../interfaces/gateways";
import { ClientUseCases } from "../usecases/client";

export class ClientController {

  private dbConnection: DatabaseConnection;
  private clientGateway: ClientGatewayInterface;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.clientGateway = new ClientGateway(this.dbConnection);
  }

  public create = async (req, res) => {
    try {
      const client = await new ClientUseCases(this.clientGateway).createClient(req.body);

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
      const response = await this.clientGateway.update(parseInt(req.params.id), req.body);

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
        const response = await this.clientGateway.findById(clientId);
        return res.status(200).json({
          success: true,
          data: response
        });
      }

      const response = await this.clientGateway.findAll();

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
      await this.clientGateway.delete(clientId);

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