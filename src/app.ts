import dotenv from 'dotenv';
import { Pool } from 'pg';
import { WorkshopApp } from "./api";

dotenv.config();

const postgresConnection = new Pool({
    connectionString: process.env.DATABASE_URL
});

postgresConnection.on('connect', () => {
    console.log('Base de Dados conectado com sucesso!');
});

const workshopApp = new WorkshopApp(postgresConnection);

workshopApp.start();
