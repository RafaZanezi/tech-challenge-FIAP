import { NotFoundHttpError } from "../api/errors/http-errors";
import { Supply } from "../entities/supply";
import { SupplyGatewayInterface } from "../interfaces/gateways";
import { ConflictError } from "./errors/errors";

export class SupplyUseCases {
  constructor(private supplyGateway: SupplyGatewayInterface) { }

  async createSupply(supply: Supply): Promise<Supply> {
    const existingSupply = await this.supplyGateway.findByName(supply.name);

    if (existingSupply) {
      throw new ConflictError('Insumo com este nome já existe');
    }

    const savedSupplyDTO = await this.supplyGateway.insert(supply);

    return new Supply({
      name: savedSupplyDTO.name,
      quantity: savedSupplyDTO.quantity,
      price: savedSupplyDTO.price
    }, savedSupplyDTO.id);
  }

  async findSupplyById(id: number): Promise<Supply | null> {
    const supplyDTO = await this.supplyGateway.findById(id);

    if (!supplyDTO) {
      throw new NotFoundHttpError('Insumo');
    }

    return new Supply({
      name: supplyDTO.name,
      quantity: supplyDTO.quantity,
      price: supplyDTO.price
    }, supplyDTO.id);
  }

  async findAllSupplies(): Promise<Supply[]> {
    const suppliesDTO = await this.supplyGateway.findAll();
    return suppliesDTO.map(supplyDTO => new Supply({
      name: supplyDTO.name,
      quantity: supplyDTO.quantity,
      price: supplyDTO.price
    }, supplyDTO.id));
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

    const updatedSupplyDTO = await this.supplyGateway.update(id, {
      name: name ?? supply.name,
      quantity: quantity ?? supply.quantity,
      price: price ?? supply.price
    });

    return new Supply({
      name: updatedSupplyDTO.name,
      quantity: updatedSupplyDTO.quantity,
      price: updatedSupplyDTO.price
    }, updatedSupplyDTO.id);
  }

  async deleteSupply(id: number): Promise<void> {
    const supply = await this.supplyGateway.findById(id);

    if (!supply) {
      throw new NotFoundHttpError('Insumo');
    }

   await this.supplyGateway.delete(id);
  }
}