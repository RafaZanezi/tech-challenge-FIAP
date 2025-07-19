import express from 'express';
import routes from './config/routes';
import { errorHandler } from '../shared/infrastructure/http/error-handler';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routes(app);

// Error Handler - deve ser o último middleware
app.use(errorHandler);

export default app;
