import { NotFoundHttpError } from "../api/errors/http-errors";
import { Vehicle } from "../entities/vehicle";
import { VehicleGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class VehicleUseCases {
  constructor(private vehicleGateway: VehicleGatewayInterface) { }

  async createVehicle(data: Vehicle): Promise<Vehicle> {
    const existingVehicle = await this.vehicleGateway.findByLicensePlate(data.licensePlate);

    if (existingVehicle) {
      throw new ConflictError('Veículo com esta placa já existe');
    }

    const vehicle = new Vehicle({
      brand: data.brand,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      clientId: data.clientId
    });

    const savedVehicle = await this.vehicleGateway.insert(vehicle);

    return savedVehicle;
  }

  async findVehicleById(id: number): Promise<Vehicle | null> {
    const vehicle = await this.vehicleGateway.findById(id);

    if (!vehicle) {
      throw new Error(`Veículo com id ${id} não encontrado`);
    }

    return vehicle;
  }

  async findAllVehicles(): Promise<Vehicle[]> {
    return await this.vehicleGateway.findAll();
  }

  async findVehiclesByClientId(clientId: number): Promise<Vehicle[]> {
    return await this.vehicleGateway.findByClientId(clientId);
  }

  async updateVehicle(id: number, data: Vehicle): Promise<Vehicle> {
    const { brand, model, year, licensePlate, clientId } = data;

    const vehicle = await this.vehicleGateway.findById(id);

    if (!vehicle) {
      throw new NotFoundHttpError('Veículo');
    }

    if (licensePlate) {
      const existingVehicle = await this.vehicleGateway.findByLicensePlate(licensePlate);

      if (existingVehicle && existingVehicle.id !== id) {
        throw new ConflictError('Veículo com esta placa já existe');
      }
    }

    const updatedVehicle = await this.vehicleGateway.update(id, {
      brand: brand ?? vehicle.brand,
      model: model ?? vehicle.model,
      year: year ?? vehicle.year,
      licensePlate: licensePlate ?? vehicle.licensePlate,
      clientId: clientId ?? vehicle.clientId
    });

    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    const vehicle = await this.vehicleGateway.findById(id);

    if (!vehicle) {
      throw new NotFoundHttpError('Veículo');
    }

    return this.vehicleGateway.delete(id);
  }
}