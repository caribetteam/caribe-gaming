import 'dotenv/config';
import { z } from 'zod';
const optionalSecret = z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional());
const envSchema = z.object({
    APP_MODE: z.enum(['local', 'integrated']).default('local'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGINS: z.string().default('http://localhost:4200'),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    ASAAS_API_URL: z.string().url().default('https://api-sandbox.asaas.com/v3'),
    ASAAS_API_KEY: optionalSecret,
    ASAAS_WEBHOOK_TOKEN: optionalSecret,
    RAWG_API_KEY: optionalSecret,
    RAWG_API_URL: z.string().url().default('https://api.rawg.io/api'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}
const values = parsedEnv.data;
if (values.APP_MODE === 'integrated') {
    const requiredIntegrated = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'ASAAS_API_KEY',
        'ASAAS_WEBHOOK_TOKEN',
    ];
    const missing = requiredIntegrated.filter((key) => !values[key]);
    if (missing.length > 0) {
        throw new Error(`Integrated mode requires: ${missing.join(', ')}`);
    }
}
export const env = {
    appMode: values.APP_MODE,
    port: values.PORT,
    corsOrigins: values.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    supabaseUrl: values.SUPABASE_URL,
    supabaseServiceRoleKey: values.SUPABASE_SERVICE_ROLE_KEY,
    asaasApiUrl: values.ASAAS_API_URL,
    asaasApiKey: values.ASAAS_API_KEY,
    asaasWebhookToken: values.ASAAS_WEBHOOK_TOKEN,
    rawgApiKey: values.RAWG_API_KEY,
    rawgApiUrl: values.RAWG_API_URL,
};
