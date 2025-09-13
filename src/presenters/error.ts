import { BasePresenter } from "./base-presenter";

export class ErrorPresenter extends BasePresenter {
  present(error: Error): void {
    this.statusCode = 500;
    this.response = {
      success: false,
      message: error.message ?? 'Ocorreu um erro ao processar'
    };
  }
}