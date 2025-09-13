import { Vehicle } from '../entities/vehicle';
import { BasePresenter } from './base-presenter';

export class VehicleCreatedPresenter extends BasePresenter {
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
}
