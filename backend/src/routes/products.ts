import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error-handler.js';

const slugSchema = z.string().trim().min(1).max(160);

export const productsRouter = Router();

productsRouter.get('/products', async (_request, response, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .select(
        'id, slug, name, steam_app_id, price_cents, currency, category, platform, image_url, active',
      )
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new HttpError(502, 'Não foi possível carregar os produtos.', 'products_read_failed');
    }

    response.json({ products: data });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/products/:slug', async (request, response, next) => {
  try {
    const slug = slugSchema.parse(request.params['slug']);
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .select(
        'id, slug, name, steam_app_id, price_cents, currency, category, platform, image_url, active',
      )
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      throw new HttpError(502, 'Não foi possível carregar o produto.', 'product_read_failed');
    }
    if (!data) {
      throw new HttpError(404, 'Produto não encontrado.', 'product_not_found');
    }

    response.json({ product: data });
  } catch (error) {
    next(
      error instanceof z.ZodError
        ? new HttpError(400, 'Slug de produto inválido.', 'invalid_product_slug')
        : error,
    );
  }
});
