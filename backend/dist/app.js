import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { cartRouter } from './routes/cart.js';
import { favoritesRouter } from './routes/favorites.js';
import { healthRouter } from './routes/health.js';
export const app = express();
app.disable('x-powered-by');
app.use(cors({
    origin: env.corsOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(healthRouter);
app.use('/api', cartRouter);
app.use('/api', favoritesRouter);
app.use('/api', (_request, response) => {
    response.status(404).json({
        error: {
            code: 'route_not_found',
            message: 'Rota não encontrada.',
        },
    });
});
app.use(errorHandler);
