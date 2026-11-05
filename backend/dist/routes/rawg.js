import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/error-handler.js';
const gameIdSchema = z.union([
    z.coerce.number().int().positive(),
    z.string().trim().min(1).max(160),
]);
export const rawgRouter = Router();
async function proxyRawg(path, response) {
    if (!env.rawgApiKey) {
        throw new HttpError(503, 'Detalhes externos de jogos indisponíveis.', 'rawg_unavailable');
    }
    const url = new URL(`${env.rawgApiUrl.replace(/\/$/, '')}${path}`);
    url.searchParams.set('key', env.rawgApiKey);
    const upstream = await fetch(url);
    if (!upstream.ok) {
        throw new HttpError(502, 'Não foi possível carregar os dados externos do jogo.', 'rawg_request_failed');
    }
    response.json(await upstream.json());
}
rawgRouter.get('/rawg/games/:id', async (request, response, next) => {
    try {
        const id = gameIdSchema.parse(request.params['id']);
        await proxyRawg(`/games/${encodeURIComponent(String(id))}`, response);
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Identificador de jogo inválido.', 'invalid_rawg_game')
            : error);
    }
});
rawgRouter.get('/rawg/games/:id/screenshots', async (request, response, next) => {
    try {
        const id = gameIdSchema.parse(request.params['id']);
        await proxyRawg(`/games/${encodeURIComponent(String(id))}/screenshots`, response);
    }
    catch (error) {
        next(error instanceof z.ZodError
            ? new HttpError(400, 'Identificador de jogo inválido.', 'invalid_rawg_game')
            : error);
    }
});
