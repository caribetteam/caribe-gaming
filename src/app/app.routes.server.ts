import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'jogos', renderMode: RenderMode.Client },
  { path: 'produto/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender }
];