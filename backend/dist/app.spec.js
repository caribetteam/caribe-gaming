import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
process.env['APP_MODE'] = 'integrated';
process.env['SUPABASE_URL'] = 'https://example.supabase.co';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';
process.env['ASAAS_API_KEY'] = 'test-asaas-key';
process.env['ASAAS_WEBHOOK_TOKEN'] = 'test-webhook-token';
const state = vi.hoisted(() => ({
    rpc: vi.fn(),
    from: vi.fn(),
    update: vi.fn(),
    authGetUser: vi.fn(),
}));
vi.mock('./config/supabase.js', () => ({
    getSupabaseAdmin: () => ({
        rpc: state.rpc,
        from: state.from,
        auth: { getUser: state.authGetUser },
    }),
}));
function query(result) {
    const chain = {};
    for (const method of ['select', 'eq', 'in', 'order', 'upsert', 'update', 'delete', 'not']) {
        chain[method] = vi.fn(() => chain);
    }
    chain['single'] = vi.fn(() => Promise.resolve(result));
    chain['maybeSingle'] = vi.fn(() => Promise.resolve(result));
    chain.then = (resolve) => Promise.resolve(result).then(resolve);
    return chain;
}
describe('backend API', () => {
    let app;
    let createOrder;
    beforeAll(async () => {
        ({ app } = await import('./app.js'));
        ({ createOrder } = await import('./services/order.js'));
    });
    beforeEach(() => {
        vi.clearAllMocks();
        state.authGetUser.mockResolvedValue({
            data: { user: { id: '11111111-1111-4111-8111-111111111111' } },
            error: null,
        });
    });
    it('returns 401 when a protected route has no token', async () => {
        const response = await request(app).get('/api/cart');
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('authentication_required');
    });
    it('rejects invalid cart input with the Zod error contract', async () => {
        const response = await request(app)
            .post('/api/cart/items')
            .set('Authorization', 'Bearer test-token')
            .send({ productId: 'not-a-uuid', quantity: 0 });
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('invalid_cart_item');
        expect(state.from).not.toHaveBeenCalled();
    });
    it('uses the database RPC result as the server-calculated order total', async () => {
        const productId = '22222222-2222-4222-8222-222222222222';
        const userId = '11111111-1111-4111-8111-111111111111';
        state.rpc.mockResolvedValue({
            data: '33333333-3333-4333-8333-333333333333',
            error: null,
        });
        state.from.mockReturnValue(query({
            data: {
                id: '33333333-3333-4333-8333-333333333333',
                user_id: userId,
                total_cents: 1599,
                payment_method: 'pix',
                status: 'pending',
                asaas_payment_id: 'pay_test',
            },
            error: null,
        }));
        const order = await createOrder(userId, {
            items: [{ productId, quantity: 2 }],
            paymentMethod: 'pix',
            idempotencyKey: 'order-test-1',
            customer: { name: 'Cliente Teste', email: 'cliente@example.com', cpfCnpj: '12345678901' },
        });
        expect(order.total_cents).toBe(1599);
        expect(state.rpc).toHaveBeenCalledWith('create_order', {
            p_user_id: userId,
            p_idempotency_key: 'order-test-1',
            p_items: [{ productId, quantity: 2 }],
            p_method: 'pix',
        });
    });
    it('ignores a repeated webhook status without updating the order', async () => {
        const orderQuery = query({
            data: {
                id: '33333333-3333-4333-8333-333333333333',
                status: 'paid',
            },
            error: null,
        });
        state.from.mockReturnValue(orderQuery);
        const response = await request(app)
            .post('/api/webhooks/asaas')
            .set('asaas-access-token', 'test-webhook-token')
            .send({
            event: 'PAYMENT_CONFIRMED',
            payment: { id: 'pay_test', status: 'CONFIRMED' },
        });
        expect(response.status).toBe(204);
        expect(orderQuery['update']).not.toHaveBeenCalled();
    });
});
