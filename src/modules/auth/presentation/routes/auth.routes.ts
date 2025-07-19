import express from 'express';
import { makeAuthController } from '../../../../main/factories/auth-controller.factory';

const routerAuth = express.Router();

const authController = makeAuthController();

routerAuth.post('/register', authController.register);
routerAuth.post('/login', authController.login);
routerAuth.post('/logout', authController.logout);

export default routerAuth;
