import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'jogos', renderMode: RenderMode.Client },
  { path: 'produto/:slug', renderMode: RenderMode.Client },
  { path: 'produtos/:slug', renderMode: RenderMode.Client },
  { path: '404', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];