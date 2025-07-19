export interface UseCase<T = any, R = any> {
  execute(request: T): Promise<R>;
}
