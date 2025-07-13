import express from 'express';
import AuthController from '../controllers/auth.controller';

const routerAuth = express.Router();

routerAuth.post('/register', AuthController.register);
routerAuth.post('/login', AuthController.login);
routerAuth.post('/logout', AuthController.logout);

export default routerAuth;