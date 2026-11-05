import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { HttpError } from './error-handler.js';

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  if (env.appMode !== 'integrated') {
    next(
      new HttpError(
        503,
        'Autenticação integrada não está configurada neste ambiente.',
        'authentication_unavailable',
      ),
    );
    return;
  }

  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    next(new HttpError(401, 'Autenticação obrigatória.', 'authentication_required'));
    return;
  }

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !data.user) {
      next(new HttpError(401, 'Token de autenticação inválido.', 'invalid_token'));
      return;
    }

    request.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUserId(request: Request): string {
  if (!request.userId) {
    throw new HttpError(401, 'Autenticação obrigatória.', 'authentication_required');
  }
  return request.userId;
}
