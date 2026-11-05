import { Router } from 'express';
import { createOrder, createOrderSchema } from '../services/order.js';
import { getAuthenticatedUserId, requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error-handler.js';
export const ordersRouter = Router();
ordersRouter.post('/orders', requireAuth, async (request, response, next) => {
    try {
        const input = createOrderSchema.parse(request.body);
        const order = await createOrder(getAuthenticatedUserId(request), input);
        response.status(201).json({ order });
    }
    catch (error) {
        next(error instanceof HttpError
            ? error
            : error instanceof Error && error.name === 'ZodError'
                ? new HttpError(400, 'Dados do pedido inválidos.', 'invalid_order_request')
                : error);
    }
});
