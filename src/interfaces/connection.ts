export interface DatabaseConnection {
    query<T = any>(text: string, params?: any[]): Promise<T>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}