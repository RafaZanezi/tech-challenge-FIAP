import { NotFoundHttpError } from "../api/errors/http-errors";
import { Vehicle } from "../entities/vehicle";
import { VehicleGatewayInterface, ClientGatewayInterface } from "../interfaces/gateways";
import { ConflictError, ValidationError } from "./errors/errors";

export class VehicleUseCases {
  constructor(
    private vehicleGateway: VehicleGatewayInterface, 
    private clientGateway: ClientGatewayInterface
  ) { }

  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const existingVehicle = await this.vehicleGateway.findByLicensePlate(vehicle.licensePlate);

    if (existingVehicle) {
      throw new ConflictError('Veículo com esta placa já existe');
    }

    // Verificar se o cliente existe
    const client = await this.clientGateway.findById(vehicle.clientId);
    if (!client) {
      throw new ValidationError('Cliente não encontrado');
    }

    const savedVehicleDTO = await this.vehicleGateway.insert(vehicle);

    return new Vehicle({
      brand: savedVehicleDTO.brand,
      model: savedVehicleDTO.model,
      year: savedVehicleDTO.year,
      licensePlate: savedVehicleDTO.licensePlate,
      clientId: savedVehicleDTO.clientId
    }, savedVehicleDTO.id);
  }

  async findVehicleById(id: number): Promise<Vehicle | null> {
    const vehicleDTO = await this.vehicleGateway.findById(id);

    if (!vehicleDTO) {
      throw new NotFoundHttpError(`Veículo`);
    }

    return new Vehicle({
      brand: vehicleDTO.brand,
      model: vehicleDTO.model,
      year: vehicleDTO.year,
      licensePlate: vehicleDTO.licensePlate,
      clientId: vehicleDTO.clientId
    }, vehicleDTO.id);
  }

  async findAllVehicles(): Promise<Vehicle[]> {
    const vehiclesDTO = await this.vehicleGateway.findAll();
    return vehiclesDTO.map(vehicleDTO => new Vehicle({
      brand: vehicleDTO.brand,
      model: vehicleDTO.model,
      year: vehicleDTO.year,
      licensePlate: vehicleDTO.licensePlate,
      clientId: vehicleDTO.clientId
    }, vehicleDTO.id));
  }

  async findVehiclesByClientId(clientId: number): Promise<Vehicle[]> {
    const vehiclesDTO = await this.vehicleGateway.findByClientId(clientId);
    return vehiclesDTO.map(vehicleDTO => new Vehicle({
      brand: vehicleDTO.brand,
      model: vehicleDTO.model,
      year: vehicleDTO.year,
      licensePlate: vehicleDTO.licensePlate,
      clientId: vehicleDTO.clientId
    }, vehicleDTO.id));
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

    const updatedVehicleDTO = await this.vehicleGateway.update(id, {
      brand: brand ?? vehicle.brand,
      model: model ?? vehicle.model,
      year: year ?? vehicle.year,
      licensePlate: licensePlate ?? vehicle.licensePlate,
      clientId: clientId ?? vehicle.clientId
    });

    return new Vehicle({
      brand: updatedVehicleDTO.brand,
      model: updatedVehicleDTO.model,
      year: updatedVehicleDTO.year,
      licensePlate: updatedVehicleDTO.licensePlate,
      clientId: updatedVehicleDTO.clientId
    }, updatedVehicleDTO.id);
  }

  async deleteVehicle(id: number): Promise<void> {
    const vehicle = await this.vehicleGateway.findById(id);

    if (!vehicle) {
      throw new NotFoundHttpError('Veículo');
    }

    return this.vehicleGateway.delete(id);
  }
}