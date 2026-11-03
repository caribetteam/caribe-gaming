import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth, getAuthenticatedUserId } from '../middleware/auth.js';
import { HttpError } from '../middleware/error-handler.js';
const productIdSchema = z.string().uuid();
export const favoritesRouter = Router();
favoritesRouter.use(requireAuth);
favoritesRouter.get('/favorites', async (request, response, next) => {
    try {
        const userId = getAuthenticatedUserId(request);
        const { data, error } = await getSupabaseAdmin()
            .from('favorites')
            .select('product_id, created_at, products(slug, name, image_url, price_cents)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new HttpError(502, 'Não foi possível carregar os favoritos.', 'favorites_read_failed');
        }
        response.json({ items: data });
    }
    catch (error) {
        next(error);
    }
});
favoritesRouter.post('/favorites', async (request, response, next) => {
    try {
        const userId = getAuthenticatedUserId(request);
        const productId = productIdSchema.parse(request.body?.productId);
        const { data, error } = await getSupabaseAdmin()
            .from('favorites')
            .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
            .select('product_id, created_at')
            .single();
        if (error) {
            throw new HttpError(400, 'Não foi possível adicionar o favorito.', 'favorite_create_failed');
        }
        response.status(201).json({ item: data });
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Produto inválido.', 'invalid_product_id')
            : error);
    }
});
favoritesRouter.delete('/favorites/:productId', async (request, response, next) => {
    try {
        const userId = getAuthenticatedUserId(request);
        const productId = productIdSchema.parse(request.params['productId']);
        const { error } = await getSupabaseAdmin()
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        if (error) {
            throw new HttpError(400, 'Não foi possível remover o favorito.', 'favorite_delete_failed');
        }
        response.status(204).send();
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Produto inválido.', 'invalid_product_id')
            : error);
    }
});
