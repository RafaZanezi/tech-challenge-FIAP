import express from 'express';
import { DatabaseConnection } from "../interfaces/connection";
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

		// app.use('/auth', routerAuth);

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