import express from 'express';
import { DatabaseConnection } from "../interfaces/connection";
import { AuthAPI } from './auth';
import { ClientAPI } from './client';
import { ServiceAPI } from './service';
import { ServiceOrderAPI } from './service-order';
import { SupplyAPI } from './supply';
import { VehicleAPI } from './vehicle';

export class WorkshopApp {

	private _dbConnection: DatabaseConnection;

	constructor(dbConnection: DatabaseConnection) {
		this._dbConnection = dbConnection;
	}

	start() {
		const app = express();

		const authRoutes = new AuthAPI(this._dbConnection);
		const clientRoutes = new ClientAPI(this._dbConnection);
		const serviceRoutes = new ServiceAPI(this._dbConnection);
		const serviceOrderRoutes = new ServiceOrderAPI(this._dbConnection);
		const supplyRoutes = new SupplyAPI(this._dbConnection);
		const vehicleRoutes = new VehicleAPI(this._dbConnection);

		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.route('/').get((_, res) => {
			res.status(200).send({ title: 'Bem vindo ao Sistema Integrado de Atendimento e Execução de Serviços' });
		});

		// Health check endpoint for CI/CD pipeline
		app.route('/health').get(async (_, res) => {
			try {
				// Test database connection
				const result = await this._dbConnection.query('SELECT 1 as health');
				res.status(200).json({
					status: 'healthy',
					timestamp: new Date().toISOString(),
					database: 'connected',
					uptime: process.uptime()
				});
			} catch (error) {
				res.status(503).json({
					status: 'unhealthy',
					timestamp: new Date().toISOString(),
					database: 'disconnected',
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		});

		app.use('/api', authRoutes.getRoutes());
		app.use('/api', clientRoutes.getRoutes());
		app.use('/api', serviceRoutes.getRoutes());
		app.use('/api', serviceOrderRoutes.getRoutes());
		app.use('/api', supplyRoutes.getRoutes());
		app.use('/api', vehicleRoutes.getRoutes());

		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`Servidor rodando na porta ${port}`);
		});
	}
}