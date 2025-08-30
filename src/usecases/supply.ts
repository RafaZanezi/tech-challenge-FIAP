import { NotFoundHttpError } from "../api/errors/http-errors";
import { Supply } from "../entities/supply";
import { SupplyGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class SupplyUseCases {
  constructor(private supplyGateway: SupplyGatewayInterface) { }

  async createSupply(data: Supply): Promise<Supply> {
    const existingSupply = await this.supplyGateway.findByName(data.name);

    if (existingSupply) {
      throw new ConflictError('Insumo com este nome já existe');
    }

    const supply = new Supply({
      name: data.name,
      quantity: data.quantity,
      price: data.price
    });

    const savedSupply = await this.supplyGateway.insert(supply);

    return savedSupply;
  }

  async findSupplyById(id: number): Promise<Supply | null> {
    const supply = await this.supplyGateway.findById(id);

    if (!supply) {
      throw new Error(`Insumo com id ${id} não encontrado`);
    }

    return supply;
  }

  async findAllSupplies(): Promise<Supply[]> {
    return await this.supplyGateway.findAll();
  }

  async updateSupply(id: number, data: Supply): Promise<Supply> {
    const { name, quantity, price } = data;

    const supply = await this.supplyGateway.findById(id);

    if (!supply) {
      throw new NotFoundHttpError('Insumo');
    }

    if (name) {
      const existingSupply = await this.supplyGateway.findByName(name);

      if (existingSupply && existingSupply.id !== id) {
        throw new ConflictError('Insumo com este nome já existe');
      }
    }

    const updatedSupply = await this.supplyGateway.update(id, {
      name: name ?? supply.name,
      quantity: quantity ?? supply.quantity,
      price: price ?? supply.price
    });

    return updatedSupply;
  }

  async deleteSupply(id: number): Promise<void> {
    const supply = await this.supplyGateway.findById(id);

    if (!supply) {
      throw new NotFoundHttpError('Insumo');
    }

    return this.supplyGateway.delete(id);
  }
}