import { getSupabaseAdmin } from '../config/supabase.js';
import { getAuthenticatedUserId } from './auth.js';
import { HttpError } from './error-handler.js';
export async function requireAdmin(request, _response, next) {
    try {
        const userId = getAuthenticatedUserId(request);
        const { data, error } = await getSupabaseAdmin()
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            throw new HttpError(502, 'Não foi possível verificar a autorização.', 'admin_check_failed');
        }
        if (data?.role !== 'admin') {
            throw new HttpError(403, 'Acesso administrativo obrigatório.', 'admin_required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
