import express from 'express';
import routes from './main/config/routes';
// import dotenvSafe from 'dotenv-safe';
// import jwt from 'jsonwebtoken';

// dotenvSafe.config();

const app = express();
routes(app);

export default app;