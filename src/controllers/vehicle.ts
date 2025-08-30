import { VehicleGateway } from "../gateways/vehicle";
import { DatabaseConnection } from "../interfaces/connection";
import { VehicleGatewayInterface } from "../interfaces/gateways";
import { VehicleUseCases } from "../usecases/vehicle";

export class VehicleController {

  private dbConnection: DatabaseConnection;
  private vehicleGateway: VehicleGatewayInterface;
  private vehicleUseCase: VehicleUseCases;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.vehicleGateway = new VehicleGateway(this.dbConnection);
    this.vehicleUseCase = new VehicleUseCases(this.vehicleGateway);
  }

  public create = async (req, res) => {
    try {
      const vehicle = await this.vehicleUseCase.createVehicle(req.body);

      res.status(201).json({
        success: true,
        data: vehicle
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
      const response = await this.vehicleUseCase.updateVehicle(parseInt(req.params.id), req.body);

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
      const vehicleId = req.params.id;

      if (vehicleId) {
        const response = await this.vehicleUseCase.findVehicleById(vehicleId);
        return res.status(200).json({
          success: true,
          data: response
        });
      }

      const response = await this.vehicleUseCase.findAllVehicles();

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

  public findByClient = async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const response = await this.vehicleUseCase.findVehiclesByClientId(clientId);

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
      const vehicleId = req.params.id;
      await this.vehicleUseCase.deleteVehicle(vehicleId);

      res.status(200).json({
        success: true,
        message: 'Veículo deletado com sucesso'
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }
}