import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'jogos', renderMode: RenderMode.Client },
  { path: 'produtos/:slug', renderMode: RenderMode.Server }, // 👈 Adicionada no plural e alterada para Server
  { path: 'produto/:slug', renderMode: RenderMode.Server },  // Mantida caso você também use no singular
  { path: '404', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender }
];
