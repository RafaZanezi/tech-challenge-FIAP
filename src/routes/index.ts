import express from 'express';
import routerClients from './domain/client.routes';
import routerVehicles from './domain/vehicle.routes';
import routerAuth from './auth.routes';
import routerSupplies from './domain/supply.routes';
import routerServiceOrders from './domain/service-order.routes';

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