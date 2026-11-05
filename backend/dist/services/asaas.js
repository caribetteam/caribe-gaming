import { env } from '../config/env.js';
import { HttpError } from '../middleware/error-handler.js';
export class AsaasService {
    ensureAvailable() {
        if (env.appMode !== 'integrated' || !env.asaasApiKey) {
            throw new HttpError(503, 'Pagamentos em Sandbox não estão configurados neste ambiente.', 'payments_unavailable');
        }
    }
    async createCustomer(input) {
        this.ensureAvailable();
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify({
                name: input.name,
                email: input.email,
                cpfCnpj: input.cpfCnpj,
            }),
        });
    }
    async createPayment(input) {
        this.ensureAvailable();
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify({
                customer: input.customerId,
                billingType: input.billingType,
                value: input.valueCents / 100,
                dueDate: this.tomorrow(),
                description: input.description,
            }),
        });
    }
    async request(path, init) {
        try {
            const response = await fetch(`${env.asaasApiUrl}${path}`, {
                ...init,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    access_token: env.asaasApiKey,
                    ...init.headers,
                },
            });
            const body = await response.json().catch(() => undefined);
            if (!response.ok) {
                console.error('Asaas request failed', {
                    path,
                    status: response.status,
                    body,
                });
                throw new HttpError(502, 'O Asaas recusou a operação de pagamento.', 'asaas_request_failed');
            }
            return body;
        }
        catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.error('Asaas request unavailable', { path, error });
            throw new HttpError(502, 'Não foi possível conectar ao Asaas Sandbox.', 'asaas_unavailable');
        }
    }
    tomorrow() {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + 1);
        return date.toISOString().slice(0, 10);
    }
}
export function asaasBillingType(method) {
    switch (method) {
        case 'pix':
            return 'PIX';
        case 'cartao':
            return 'CREDIT_CARD';
        case 'boleto':
            return 'BOLETO';
        default:
            throw new HttpError(400, 'Método de pagamento inválido.', 'invalid_payment_method');
    }
}
