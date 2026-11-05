import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import { getAuthenticatedUserId, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { HttpError } from '../middleware/error-handler.js';
const uuidSchema = z.string().uuid();
const roleSchema = z.enum(['customer', 'admin']);
const orderStatusSchema = z.enum([
    'pending',
    'payment_pending',
    'paid',
    'failed',
    'cancelled',
    'completed',
]);
const productSchema = z.object({
    slug: z.string().trim().min(1).max(160),
    name: z.string().trim().min(1).max(240),
    description: z.string().max(10000).nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    platform: z.string().trim().min(1).max(80),
    category: z.string().trim().max(120).nullable().optional(),
    steam_app_id: z.number().int().positive().nullable().optional(),
    price_cents: z.number().int().min(0),
    currency: z.string().regex(/^[A-Z]{3}$/),
    active: z.boolean().default(true),
});
const productPatchSchema = productSchema.partial();
const statusRank = {
    pending: 0,
    payment_pending: 1,
    failed: 2,
    cancelled: 2,
    paid: 3,
    completed: 4,
};
export const adminRouter = Router();
adminRouter.use('/admin', requireAuth, requireAdmin);
adminRouter.get('/admin/summary', async (_request, response, next) => {
    try {
        const supabase = getSupabaseAdmin();
        const [products, pendingOrders, users] = await Promise.all([
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
            supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .in('status', ['pending', 'payment_pending']),
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);
        const failed = [products, pendingOrders, users].find((result) => result.error);
        if (failed?.error) {
            throw new HttpError(502, 'Não foi possível carregar o resumo administrativo.', 'admin_summary_failed');
        }
        response.json({
            products: products.count ?? 0,
            pendingOrders: pendingOrders.count ?? 0,
            users: users.count ?? 0,
        });
    }
    catch (error) {
        next(error);
    }
});
adminRouter.get('/admin/products', async (_request, response, next) => {
    try {
        const { data, error } = await getSupabaseAdmin()
            .from('products')
            .select('id, slug, name, description, image_url, platform, category, steam_app_id, price_cents, currency, active, synced_at, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (error) {
            throw new HttpError(502, 'Não foi possível carregar os produtos.', 'admin_products_read_failed');
        }
        response.json({ products: data });
    }
    catch (error) {
        next(error);
    }
});
adminRouter.post('/admin/products', async (request, response, next) => {
    try {
        const input = productSchema.parse(request.body);
        const { data, error } = await getSupabaseAdmin().from('products').insert(input).select().single();
        if (error) {
            throw new HttpError(400, 'Não foi possível criar o produto.', 'admin_product_create_failed');
        }
        response.status(201).json({ product: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Dados do produto inválidos.', 'invalid_product_request')
            : error);
    }
});
adminRouter.patch('/admin/products/:id', async (request, response, next) => {
    try {
        const id = uuidSchema.parse(request.params['id']);
        const input = productPatchSchema.parse(request.body);
        if (Object.keys(input).length === 0) {
            throw new HttpError(400, 'Informe ao menos um campo para atualizar.', 'empty_product_update');
        }
        const { data, error } = await getSupabaseAdmin()
            .from('products')
            .update(input)
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error) {
            throw new HttpError(400, 'Não foi possível atualizar o produto.', 'admin_product_update_failed');
        }
        if (!data) {
            throw new HttpError(404, 'Produto não encontrado.', 'product_not_found');
        }
        response.json({ product: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Dados do produto inválidos.', 'invalid_product_request')
            : error);
    }
});
adminRouter.delete('/admin/products/:id', async (request, response, next) => {
    try {
        const id = uuidSchema.parse(request.params['id']);
        const { data, error } = await getSupabaseAdmin()
            .from('products')
            .update({ active: false })
            .eq('id', id)
            .select('id, active')
            .maybeSingle();
        if (error) {
            throw new HttpError(400, 'Não foi possível desativar o produto.', 'admin_product_delete_failed');
        }
        if (!data) {
            throw new HttpError(404, 'Produto não encontrado.', 'product_not_found');
        }
        response.json({ product: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Produto inválido.', 'invalid_product_id')
            : error);
    }
});
adminRouter.get('/admin/orders', async (_request, response, next) => {
    try {
        const { data, error } = await getSupabaseAdmin()
            .from('orders')
            .select('id, user_id, status, total_cents, payment_method, asaas_payment_id, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (error) {
            throw new HttpError(502, 'Não foi possível carregar os pedidos.', 'admin_orders_read_failed');
        }
        response.json({ orders: data });
    }
    catch (error) {
        next(error);
    }
});
adminRouter.patch('/admin/orders/:id/status', async (request, response, next) => {
    try {
        const id = uuidSchema.parse(request.params['id']);
        const status = orderStatusSchema.parse(request.body?.status);
        const supabase = getSupabaseAdmin();
        const { data: current, error: readError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', id)
            .maybeSingle();
        if (readError) {
            throw new HttpError(502, 'Não foi possível localizar o pedido.', 'admin_order_read_failed');
        }
        if (!current) {
            throw new HttpError(404, 'Pedido não encontrado.', 'order_not_found');
        }
        if (statusRank[status] < statusRank[current.status]) {
            throw new HttpError(409, 'Não é permitido regredir o status do pedido.', 'order_status_regression');
        }
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .eq('status', current.status)
            .select()
            .single();
        if (error) {
            throw new HttpError(409, 'O pedido foi alterado; tente novamente.', 'order_update_conflict');
        }
        response.json({ order: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Status ou pedido inválido.', 'invalid_order_status')
            : error);
    }
});
adminRouter.get('/admin/users', async (_request, response, next) => {
    try {
        const supabase = getSupabaseAdmin();
        const [{ data: profiles, error: profilesError }, { data: authUsers, error: authError }] = await Promise.all([
            supabase.from('profiles').select('id, display_name, role, created_at, updated_at').order('created_at', { ascending: false }),
            supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ]);
        if (profilesError || authError) {
            throw new HttpError(502, 'Não foi possível carregar os usuários.', 'admin_users_read_failed');
        }
        const emails = new Map(authUsers.users.map((user) => [user.id, user.email ?? null]));
        response.json({
            users: profiles.map((profile) => ({ ...profile, email: emails.get(profile.id) ?? null })),
        });
    }
    catch (error) {
        next(error);
    }
});
adminRouter.patch('/admin/users/:id/role', async (request, response, next) => {
    try {
        const id = uuidSchema.parse(request.params['id']);
        const role = roleSchema.parse(request.body?.role);
        if (id === getAuthenticatedUserId(request) && role !== 'admin') {
            throw new HttpError(409, 'Você não pode remover a própria autorização administrativa.', 'self_demotion_forbidden');
        }
        const { data, error } = await getSupabaseAdmin()
            .from('profiles')
            .update({ role })
            .eq('id', id)
            .select('id, display_name, role, updated_at')
            .maybeSingle();
        if (error) {
            throw new HttpError(400, 'Não foi possível atualizar o perfil.', 'admin_user_role_update_failed');
        }
        if (!data) {
            throw new HttpError(404, 'Usuário não encontrado.', 'user_not_found');
        }
        response.json({ user: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Perfil inválido.', 'invalid_user_role')
            : error);
    }
});
