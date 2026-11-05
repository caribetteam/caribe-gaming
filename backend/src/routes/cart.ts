import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth, getAuthenticatedUserId } from '../middleware/auth.js';
import { HttpError } from '../middleware/error-handler.js';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export const cartRouter = Router();
cartRouter.use(requireAuth);

cartRouter.get('/cart', async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { data, error } = await getSupabaseAdmin()
      .from('cart_items')
      .select('product_id, quantity, updated_at, products(slug, name, image_url, price_cents)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new HttpError(502, 'Não foi possível carregar o carrinho.', 'cart_read_failed');
    }
    response.json({ items: data });
  } catch (error) {
    next(error);
  }
});

cartRouter.post('/cart/items', async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const item = itemSchema.parse(request.body);
    const { data, error } = await getSupabaseAdmin()
      .from('cart_items')
      .upsert(
        {
          user_id: userId,
          product_id: item.productId,
          quantity: item.quantity,
        },
        { onConflict: 'user_id,product_id' },
      )
      .select('product_id, quantity, updated_at')
      .single();

    if (error) {
      throw new HttpError(400, 'Não foi possível adicionar o item.', 'cart_item_upsert_failed');
    }
    response.status(201).json({ item: data });
  } catch (error) {
    next(error instanceof z.ZodError ? new HttpError(400, 'Item de carrinho inválido.', 'invalid_cart_item') : error);
  }
});

cartRouter.patch('/cart/items/:productId', async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const productId = z.string().uuid().parse(request.params['productId']);
    const { quantity } = z.object({ quantity: z.number().int().positive().max(99) }).parse(request.body);
    const { data, error } = await getSupabaseAdmin()
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select('product_id, quantity, updated_at')
      .maybeSingle();

    if (error) {
      throw new HttpError(400, 'Não foi possível atualizar o item.', 'cart_item_update_failed');
    }
    if (!data) {
      throw new HttpError(404, 'Item não encontrado no carrinho.', 'cart_item_not_found');
    }
    response.json({ item: data });
  } catch (error) {
    next(error instanceof z.ZodError ? new HttpError(400, 'Item de carrinho inválido.', 'invalid_cart_item') : error);
  }
});

cartRouter.delete('/cart/items/:productId', async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const productId = z.string().uuid().parse(request.params['productId']);
    const { error } = await getSupabaseAdmin()
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new HttpError(400, 'Não foi possível remover o item.', 'cart_item_delete_failed');
    }
    response.status(204).send();
  } catch (error) {
    next(error instanceof z.ZodError ? new HttpError(400, 'Produto inválido.', 'invalid_product_id') : error);
  }
});

cartRouter.delete('/cart', async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { error } = await getSupabaseAdmin().from('cart_items').delete().eq('user_id', userId);
    if (error) {
      throw new HttpError(400, 'Não foi possível limpar o carrinho.', 'cart_clear_failed');
    }
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
