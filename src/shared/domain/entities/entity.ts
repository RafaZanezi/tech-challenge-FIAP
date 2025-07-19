export abstract class Entity<T = any> {
  protected readonly _id: T;

  constructor(id?: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  public equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }
}
