export interface DatabaseConnection {
    query(text: string, params?: any[]): Promise<any>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}