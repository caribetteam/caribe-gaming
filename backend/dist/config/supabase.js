import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
let client;
export function getSupabaseAdmin() {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
        throw new Error('Supabase is not configured for the current environment.');
    }
    client ??= createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return client;
}
