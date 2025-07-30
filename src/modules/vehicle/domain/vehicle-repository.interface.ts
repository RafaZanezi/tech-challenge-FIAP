import { Vehicle } from '../domain/vehicle.entity';

export interface VehicleRepository {
  findById(id: number): Promise<Vehicle | null>;
  findAll(): Promise<Vehicle[]>;
  save(entity: Vehicle): Promise<Vehicle>;
  update(id: number, entity: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: number): Promise<void>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  findByClientId(clientId: number): Promise<Vehicle[]>;
}
