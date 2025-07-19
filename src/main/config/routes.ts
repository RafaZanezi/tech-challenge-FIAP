import express from 'express';
import routerAuth from '../../modules/auth/presentation/routes/auth.routes';
import routerClients from '../../modules/client/presentation/routes/client.routes';
import routerServiceOrders from '../../modules/service-order/presentation/routes/service-order.routes';
import routerSupplies from '../../modules/supply/presentation/routes/supply.routes';
import routerVehicles from '../../modules/vehicle/presentation/routes/vehicle.routes';

const routes = (app) => {
    app.route('/').get((_, res) => {
        res.status(200).send({ title: 'Bem vindo ao Sistema Integrado de Atendimento e Execução de Serviços' });
    });

    app.use(
        express.json(),
        routerAuth,

        routerClients,
        routerVehicles,
        routerSupplies,
        
        routerServiceOrders,
    );
}

export default routes;