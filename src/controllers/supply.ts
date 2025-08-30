import { SupplyGateway } from "../gateways/supply";
import { DatabaseConnection } from "../interfaces/connection";
import { SupplyGatewayInterface } from "../interfaces/gateways";
import { SupplyUseCases } from "../usecases/supply";

export class SupplyController {

  private dbConnection: DatabaseConnection;
  private supplyGateway: SupplyGatewayInterface;
  private supplyUseCase: SupplyUseCases;

  constructor(dbConnection: DatabaseConnection) {
    this.dbConnection = dbConnection;
    this.supplyGateway = new SupplyGateway(this.dbConnection);
    this.supplyUseCase = new SupplyUseCases(this.supplyGateway);
  }

  public create = async (req, res) => {
    try {
      const supply = await this.supplyUseCase.createSupply(req.body);

      res.status(201).json({
        success: true,
        data: supply
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
      const response = await this.supplyUseCase.updateSupply(parseInt(req.params.id), req.body);

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
      const supplyId = req.params.id;

      if (supplyId) {
        const response = await this.supplyUseCase.findSupplyById(supplyId);
        return res.status(200).json({
          success: true,
          data: response
        });
      }

      const response = await this.supplyUseCase.findAllSupplies();

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
      const supplyId = req.params.id;
      await this.supplyUseCase.deleteSupply(supplyId);

      res.status(200).json({
        success: true,
        message: 'Insumo deletado com sucesso'
      });
    } catch (error) {
      res.status(error?.statusCode ?? 500).json({
        success: false,
        message: error?.message ?? 'Ocorreu um erro ao processar'
      });
    }
  }
}