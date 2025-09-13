import { Supply } from '../entities/supply';
import { BasePresenter } from './base-presenter';

export class SupplyCreatedPresenter extends BasePresenter {
  present(supply: Supply): void {
    this.statusCode = 201;
    const { id, name, quantity, price } = supply;

    this.response = {
      success: true,
      data: {
        id,
        name,
        quantity,
        price
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
          price: supply.price
        };
      })
    };
  }
}
