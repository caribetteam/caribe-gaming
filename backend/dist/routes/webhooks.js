import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error-handler.js';
const webhookSchema = z.object({
    event: z.string().min(1),
    payment: z.object({
        id: z.string().min(1),
        status: z.string().min(1),
    }),
});
const statusRank = {
    pending: 10,
    payment_pending: 20,
    failed: 30,
    cancelled: 30,
    paid: 40,
    completed: 50,
};
function mapPaymentStatus(status) {
    switch (status) {
        case 'PENDING':
        case 'AWAITING_RISK_ANALYSIS':
            return 'payment_pending';
        case 'RECEIVED':
        case 'CONFIRMED':
            return 'paid';
        case 'OVERDUE':
        case 'REFUNDED':
        case 'CHARGEBACK':
        case 'DELETED':
            return 'failed';
        default:
            return null;
    }
}
export const webhooksRouter = Router();
webhooksRouter.post('/webhooks/asaas', async (request, response, next) => {
    try {
        if (env.appMode !== 'integrated' || !env.asaasWebhookToken) {
            throw new HttpError(503, 'Webhook Asaas não está configurado neste ambiente.', 'webhook_unavailable');
        }
        if (request.header('asaas-access-token') !== env.asaasWebhookToken) {
            throw new HttpError(401, 'Token de webhook inválido.', 'invalid_webhook_token');
        }
        const payload = webhookSchema.parse(request.body);
        const nextStatus = mapPaymentStatus(payload.payment.status);
        if (!nextStatus) {
            response.status(204).send();
            return;
        }
        const supabase = getSupabaseAdmin();
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('asaas_payment_id', payload.payment.id)
            .maybeSingle();
        if (orderError) {
            throw new HttpError(502, 'Não foi possível localizar o pedido.', 'webhook_order_lookup_failed');
        }
        if (!order || (statusRank[nextStatus] ?? 0) <= (statusRank[order.status] ?? 0)) {
            response.status(204).send();
            return;
        }
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: nextStatus })
            .eq('id', order.id)
            .eq('status', order.status);
        if (updateError) {
            throw new HttpError(502, 'Não foi possível atualizar o pedido.', 'webhook_order_update_failed');
        }
        response.status(204).send();
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Payload de webhook inválido.', 'invalid_webhook_payload')
            : error);
    }
});
