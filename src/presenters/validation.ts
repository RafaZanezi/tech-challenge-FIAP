import { BasePresenter } from "./base-presenter";

export class ValidationErrorPresenter extends BasePresenter {
  present(error: Error): void {
    this.statusCode = 400;
    this.response = {
      success: false,
      message: error.message ?? 'Dados inválidos'
    };
  }
}