import { HttpError } from '../errors/http-error';

export type Result<T, E = HttpError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export class AsyncResult {
  /**
   * Executa uma promise e retorna um Result com sucesso ou erro
   */
  static async execute<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
      const data = await promise;
      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpError) {
        return { success: false, error };
      }
      
      // Se não for HttpError, cria um erro genérico
      const httpError = new (class extends HttpError {
        constructor() {
          super(error instanceof Error ? error.message : 'Unknown error', 500);
        }
      })();
      
      return { success: false, error: httpError };
    }
  }

  /**
   * Cria uma promise rejeitada com um HttpError
   */
  static reject(error: HttpError): Promise<never> {
    return Promise.reject(error);
  }

  /**
   * Cria uma promise resolvida com dados
   */
  static resolve<T>(data: T): Promise<T> {
    return Promise.resolve(data);
  }
}

/**
 * Decorator para métodos que devem retornar Result
 */
export function handleAsync<T extends any[], R>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
) {
  const originalMethod = descriptor.value;
  
  if (!originalMethod) return descriptor;
  
  descriptor.value = async function(...args: T): Promise<R> {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      
      // Se não for HttpError, cria um erro genérico
      const httpError = new (class extends HttpError {
        constructor() {
          super(error instanceof Error ? error.message : 'Unknown error', 500);
        }
      })();
      
      throw httpError;
    }
  };
  
  return descriptor;
}
