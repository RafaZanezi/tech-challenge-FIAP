import { Vehicle } from '../entities/vehicle';
import { BasePresenter } from './base-presenter';

export class VehiclePresenter extends BasePresenter {
  present(vehicle: Vehicle): void {
    this.statusCode = 201;

    const { id, brand, model, year, licensePlate, clientId } = vehicle;

    this.response = {
      success: true,
      data: {
        id,
        brand,
        model,
        year,
        licensePlate,
        clientId
      }
    };

  }

  presentList(vehicles: Vehicle[]) {
    this.statusCode = 200;

    this.response = {
      success: true,
      data: vehicles.map(vehicle => {
        return {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          clientId: vehicle.clientId
        };
      })
    };
  }

  presentFound(vehicle: Vehicle): void {
    this.statusCode = 200;
    const { id, brand, model, year, licensePlate, clientId } = vehicle;

    this.response = {
      success: true,
      data: {
        id,
        brand,
        model,
        year,
        licensePlate,
        clientId
      }
    };
  }

  presentUpdated(vehicle: Vehicle): void {
    this.statusCode = 200;
    const { id, brand, model, year, licensePlate, clientId } = vehicle;

    this.response = {
      success: true,
      data: {
        id,
        brand,
        model,
        year,
        licensePlate,
        clientId
      }
    };
  }

  presentDeleted(vehicle: Vehicle): void {
    this.statusCode = 200;

    this.response = {
      success: true,
      message: `Veículo com ID ${vehicle.id} deletado com sucesso`
    };
  }
}
