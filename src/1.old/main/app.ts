import express from 'express';
import { errorHandler } from '../shared/infrastructure/http/error-handler';
import routes from './config/routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routes(app);

// Error Handler - deve ser o último middleware
app.use(errorHandler);

export default app;
