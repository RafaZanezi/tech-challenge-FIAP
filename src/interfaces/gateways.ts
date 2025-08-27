import { Client } from "../entities/client";
import { Service } from "../entities/service";
import { ServiceOrder } from "../entities/service-order";
import { Supply } from "../entities/supply";
import { User } from "../entities/user-new";

interface AuthGatewayInterface {
    registerUser(name: string, password: string, role: string): Promise<User>;
    loginUser(name: string, password: string): Promise<User | null>;
    logoutUser(userId: string): Promise<void>;
}

interface ClientGatewayInterface {
    findAll(): Promise<Client[]>;
    findById(id: number): Promise<Client | null>;
    findByIdentifier(identifier: string): Promise<Client | null>;
    insert(entity: Client): Promise<Client>;
    update(id: number, entity: Partial<Client>): Promise<Client>;
    delete(id: number): Promise<void>
}

interface ServiceGatewayInterface {
    findAll(): Promise<Service[]>;
    findById(id: number): Promise<Service | null>;
    findByName(name: string): Promise<Service | null>
    insert(entity: Service): Promise<Service>;
    update(id: number, entity: Partial<Service>): Promise<Service>;
    delete(id: number): Promise<void>;
}

interface ServiceOrderGatewayInterface {
    findAll(): Promise<ServiceOrder[]>;
    findById(id: number): Promise<ServiceOrder | null>;
    findOpenOSByCarAndClient(carId: number, client: string): Promise<any>;
    create(data: ServiceOrder): Promise<ServiceOrder>;
    update(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrder>;
}

interface SupplyGatewayInterface {
    findAll(): Promise<Supply[]>;
    findById(id: number): Promise<Supply | null>;
    findByName(name: string): Promise<Supply | null>;
    insert(entity: Supply): Promise<Supply>;
    update(id: number, entity: Partial<Supply>): Promise<Supply>;
    delete(id: number): Promise<void>
}

export {
    AuthGatewayInterface,
    ClientGatewayInterface,
    ServiceGatewayInterface,
    ServiceOrderGatewayInterface,
    SupplyGatewayInterface
}