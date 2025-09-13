import { Supply } from "../entities/supply";
import { SupplyGateway } from "../gateways/supply";
import { DatabaseConnection } from "../interfaces/connection";
import { SupplyGatewayInterface } from "../interfaces/gateways";
import { SupplyCreatedPresenter } from "../presenters/supply";
import { verifyAndReturnError } from "../shared/controller-presenter-error";
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
      const supply = new Supply({
        name: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price
      });

      const newSupply = await this.supplyUseCase.createSupply(supply);

      const presenter = new SupplyCreatedPresenter();
      presenter.present(newSupply);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.supplyUseCase.updateSupply(parseInt(req.params.id), req.body);

      const presenter = new SupplyCreatedPresenter();
      presenter.present(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public find = async (req, res) => {
    try {
      const supplyId = req.params.id;
      const presenter = new SupplyCreatedPresenter();

      if (supplyId) {
        const response = await this.supplyUseCase.findSupplyById(supplyId);

        presenter.present(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());

        return;
      }

      const response = await this.supplyUseCase.findAllSupplies();

      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public delete = async (req, res) => {
    try {
      const supplyId = req.params.id;
      await this.supplyUseCase.deleteSupply(supplyId);

      const presenter = new SupplyCreatedPresenter();
      presenter.present({ id: parseInt(supplyId) } as Supply);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }
}