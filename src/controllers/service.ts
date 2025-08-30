import { ServiceGateway } from "../gateways/service";
import { DatabaseConnection } from "../interfaces/connection";
import { ServiceGatewayInterface } from "../interfaces/gateways";
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
      const service = await this.serviceUseCase.createService(req.body);

      res.status(201).json({
        success: true,
        data: service
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
      const response = await this.serviceUseCase.updateService(parseInt(req.params.id), req.body);

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
      const serviceId = req.params.id;

      if (serviceId) {
        const response = await this.serviceUseCase.findServiceById(serviceId);
        return res.status(200).json({
          success: true,
          data: response
        });
      }

      const response = await this.serviceUseCase.findAllServices();

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
      const serviceId = req.params.id;
      await this.serviceUseCase.deleteService(serviceId);

      res.status(200).json({
        success: true,
        message: 'Serviço deletado com sucesso'
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }
}