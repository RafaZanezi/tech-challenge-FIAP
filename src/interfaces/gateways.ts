import { UserDTO } from "../dtos/auth";
import { ClientDTO } from "../dtos/client";
import { ServiceDTO } from "../dtos/service";
import { ServiceOrderDTO } from "../dtos/service-order";
import { SupplyDTO } from "../dtos/supply";
import { VehicleDTO } from "../dtos/vehicle";
import { Client } from "../entities/client";
import { Service } from "../entities/service";
import { ServiceOrder } from "../entities/service-order";
import { Supply } from "../entities/supply";
import { User } from "../entities/auth-user";
import { Vehicle } from "../entities/vehicle";

interface UserGatewayInterface {
    findById(id: number): Promise<UserDTO | null>;
    findByName(name: string): Promise<UserDTO | null>;
    findAll(): Promise<UserDTO[]>;
    insert(entity: User): Promise<UserDTO>;
    update(id: number, entity: Partial<User>): Promise<UserDTO>;
    delete(id: number): Promise<void>;
}

interface ClientGatewayInterface {
    findAll(): Promise<ClientDTO[]>;
    findById(id: number): Promise<ClientDTO | null>;
    findByIdentifier(identifier: string): Promise<ClientDTO | null>;
    insert(entity: Client): Promise<ClientDTO>;
    update(id: number, entity: Partial<Client>): Promise<ClientDTO>;
    delete(id: number): Promise<void>
}

interface ServiceGatewayInterface {
    findAll(): Promise<ServiceDTO[]>;
    findById(id: number): Promise<ServiceDTO | null>;
    findByName(name: string): Promise<ServiceDTO | null>;
    insert(entity: Service): Promise<ServiceDTO>;
    update(id: number, entity: Partial<Service>): Promise<ServiceDTO>;
    delete(id: number): Promise<void>;
}

interface SupplyGatewayInterface {
    findAll(): Promise<SupplyDTO[]>;
    findById(id: number): Promise<SupplyDTO | null>;
    findByName(name: string): Promise<SupplyDTO | null>;
    insert(entity: Supply): Promise<SupplyDTO>;
    update(id: number, entity: Partial<Supply>): Promise<SupplyDTO>;
    delete(id: number): Promise<void>;
}

interface VehicleGatewayInterface {
    findAll(): Promise<VehicleDTO[]>;
    findById(id: number): Promise<VehicleDTO | null>;
    findByLicensePlate(licensePlate: string): Promise<VehicleDTO | null>;
    findByClientId(clientId: number): Promise<VehicleDTO[]>;
    insert(entity: Vehicle): Promise<VehicleDTO>;
    update(id: number, entity: Partial<Vehicle>): Promise<VehicleDTO>;
    delete(id: number): Promise<void>;
}

interface ServiceOrderGatewayInterface {
    findAll(): Promise<ServiceOrderDTO[]>;
    findById(id: number): Promise<ServiceOrderDTO | null>;
    findOpenOSByCarAndClient(carId: number, clientId: number): Promise<ServiceOrderDTO | null>;
    create(data: ServiceOrder): Promise<ServiceOrderDTO>;
    update(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrderDTO>;
    delete(id: number): Promise<void>;
}

export {
    UserGatewayInterface,
    ClientGatewayInterface,
    ServiceGatewayInterface,
    SupplyGatewayInterface,
    VehicleGatewayInterface,
    ServiceOrderGatewayInterface,
}