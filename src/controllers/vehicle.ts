import { Vehicle } from "../entities/vehicle";
import { VehicleGateway } from "../gateways/vehicle";
import { DatabaseConnection } from "../interfaces/connection";
import { VehicleGatewayInterface } from "../interfaces/gateways";
import { VehicleCreatedPresenter } from "../presenters/vehicle";
import { verifyAndReturnError } from "../shared/controller-presenter-error";
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
      const vehicle = new Vehicle({
        brand: req.body.brand,
        model: req.body.model,
        year: req.body.year,
        licensePlate: req.body.licensePlate,
        clientId: req.body.clientId
      });

      const newVehicle = await this.vehicleUseCase.createVehicle(vehicle);

      const presenter = new VehicleCreatedPresenter();
      presenter.present(newVehicle);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public update = async (req, res) => {
    try {
      const response = await this.vehicleUseCase.updateVehicle(parseInt(req.params.id), req.body);

      const presenter = new VehicleCreatedPresenter();
      presenter.present(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public find = async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const presenter = new VehicleCreatedPresenter();

      if (vehicleId) {
        const response = await this.vehicleUseCase.findVehicleById(vehicleId);

        presenter.present(response);
        res.status(presenter.getStatusCode()).send(presenter.getResponse());

        return;
      }

      const response = await this.vehicleUseCase.findAllVehicles();

      presenter.presentList(response);
      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public findByClient = async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const response = await this.vehicleUseCase.findVehiclesByClientId(clientId);

      const presenter = new VehicleCreatedPresenter();
      presenter.presentList(response);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }

  public delete = async (req, res) => {
    try {
      const vehicleId = req.params.id;
      await this.vehicleUseCase.deleteVehicle(vehicleId);

      const presenter = new VehicleCreatedPresenter();
      presenter.present({ id: parseInt(vehicleId) } as Vehicle);

      res.status(presenter.getStatusCode()).send(presenter.getResponse());
    } catch (error) {
      verifyAndReturnError(error, res);
    }
  }
}