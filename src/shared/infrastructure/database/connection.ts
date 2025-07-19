import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('Base de Dados conectado com sucesso!');
});

export default {
    query: (text: string, params?: any[]) => pool.query(text, params)
};
