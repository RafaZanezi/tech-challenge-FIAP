export abstract class BasePresenter {
  protected statusCode: number = 200;
  protected response: any = {};

  getStatusCode(): number {
    return this.statusCode;
  }

  getResponse(): any {
    return this.response;
  }

  abstract present(data: any): void;
}