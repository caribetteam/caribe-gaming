import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error-handler.js';
import { AsaasService, asaasBillingType } from './asaas.js';
export const createOrderSchema = z.object({
    items: z
        .array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
    }))
        .min(1)
        .max(100),
    paymentMethod: z.enum(['pix', 'cartao', 'boleto']),
    idempotencyKey: z.string().trim().min(1).max(200),
    customer: z.object({
        name: z.string().trim().min(3).max(160),
        email: z.string().email().max(320),
        cpfCnpj: z.string().regex(/^\d{11}(\d{3})?$/, 'CPF/CNPJ inválido'),
    }),
});
export async function createOrder(userId, input) {
    const supabase = getSupabaseAdmin();
    const { data: orderId, error: rpcError } = await supabase.rpc('create_order', {
        p_user_id: userId,
        p_idempotency_key: input.idempotencyKey,
        p_items: input.items,
        p_method: input.paymentMethod,
    });
    if (rpcError || !orderId) {
        throw new HttpError(502, 'Não foi possível criar o pedido.', 'order_creation_failed');
    }
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, total_cents, payment_method, status, asaas_payment_id')
        .eq('id', orderId)
        .single();
    if (orderError || !order) {
        throw new HttpError(502, 'Pedido criado, mas não pôde ser recuperado.', 'order_read_failed');
    }
    if (order.asaas_payment_id) {
        return order;
    }
    try {
        const asaas = new AsaasService();
        const customer = await asaas.createCustomer(input.customer);
        const payment = await asaas.createPayment({
            customerId: customer.id,
            billingType: asaasBillingType(input.paymentMethod),
            valueCents: order.total_cents,
            description: `Pedido Caribe Gaming ${order.id}`,
        });
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
            asaas_payment_id: payment.id,
            status: 'payment_pending',
        })
            .eq('id', order.id)
            .select('id, user_id, total_cents, payment_method, status, asaas_payment_id')
            .single();
        if (updateError || !updatedOrder) {
            await markOrderFailed(order.id);
            throw new HttpError(502, 'Cobrança criada, mas o pedido não pôde ser atualizado.', 'order_update_failed');
        }
        return updatedOrder;
    }
    catch (error) {
        await markOrderFailed(order.id);
        throw error;
    }
}
async function markOrderFailed(orderId) {
    const { error } = await getSupabaseAdmin()
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)
        .not('status', 'in', '(paid,completed)');
    if (error) {
        console.error('Unable to mark order as failed', { orderId, error });
    }
}
