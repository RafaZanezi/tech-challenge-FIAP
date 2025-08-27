import express from 'express';
import { DatabaseConnection } from "../interfaces/connection";
import { ClientAPI } from './client';
export class WorkshopApp {

	private _dbConnection: DatabaseConnection;

	constructor(dbConnection: DatabaseConnection) {
		this._dbConnection = dbConnection;
	}

	start() {
		const app = express();

		const clientRoutes = new ClientAPI(this._dbConnection);

		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.route('/').get((_, res) => {
			res.status(200).send({ title: 'Bem vindo ao Sistema Integrado de Atendimento e Execução de Serviços' });
		});

		// app.use('/auth', routerAuth);

		app.use('/api', clientRoutes.getRoutes());
		// app.use('/api', routerClients);
		// app.use('/api', routerServices);
		// app.use('/api', routerVehicles);
		// app.use('/api', routerSupplies);

		// app.use('/api', routerServiceOrders);

		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`Servidor rodando na porta ${port}`);
		});
	}
}