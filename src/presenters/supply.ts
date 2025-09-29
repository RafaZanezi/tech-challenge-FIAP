import { Supply } from '../entities/supply';
import { BasePresenter } from './base-presenter';

export class SupplyPresenter extends BasePresenter {
  present(supply: Supply): void {
    this.statusCode = 201;
    const { id, name, quantity, price } = supply;

    this.response = {
      success: true,
      data: {
        id,
        name,
        quantity,
        price: parseFloat(price.toString())
      }
    };
  }

  presentList(supplies: Supply[]) {
    this.statusCode = 200;

    this.response = {
      success: true,
      data: supplies.map(supply => {
        return {
          id: supply.id,
          name: supply.name,
          quantity: supply.quantity,
          price: parseFloat(supply.price.toString())
        };
      })
    };
  }

  presentFound(supply: Supply): void {
    this.statusCode = 200;
    const { id, name, quantity, price } = supply;

    this.response = {
      success: true,
      data: {
        id,
        name,
        quantity,
        price: parseFloat(price.toString())
      }
    };
  }

  presentUpdated(supply: Supply): void {
    this.statusCode = 200;
    const { id, name, quantity, price } = supply;

    this.response = {
      success: true,
      data: {
        id,
        name,
        quantity,
        price: parseFloat(price.toString())
      }
    };
  }

  presentDeleted(supply: Supply): void {
    this.statusCode = 200;

    this.response = {
      success: true,
      message: `Insumo com ID ${supply.id} deletado com sucesso`
    };
  }
}
