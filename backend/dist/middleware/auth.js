import { getSupabaseAdmin } from '../config/supabase.js';
import { HttpError } from './error-handler.js';
export async function requireAuth(request, _response, next) {
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
    }
    catch (error) {
        next(error);
    }
}
export function getAuthenticatedUserId(request) {
    if (!request.userId) {
        throw new HttpError(401, 'Autenticação obrigatória.', 'authentication_required');
    }
    return request.userId;
}
