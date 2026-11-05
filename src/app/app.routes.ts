import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Perfil } from './features/perfil/perfil';
import { Produtos } from './features/produtos/produtos';
import { Checkout } from './features/checkout/checkout/checkout';
import { Admin } from './features/admin/admin';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
import { DetalheJogo } from './features/produtos/detalhe-jogo/detalhe-jogo';
import { Sobrenos } from './features/sobrenos/sobrenos';
import { NaoEncontrado } from './features/nao-encontrado/nao-encontrado';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home/home').then((m) => m.Home),
  },
  {
    path: 'sobre-nos',
    component: Sobrenos,
  },
  {
    path: 'jogos',
    component: Produtos, // aceita /jogos?busca=termo
  },
  // agora o endereço usa o nome do jogo: /produto/the-witcher-3-wild-hunt
  // (links antigos com número, como /produto/292030, são trocados pelo nome automaticamente)
  { path: 'produto/:slug', component: DetalheJogo },
  // rede de segurança: links antigos com "produtos/..." também funcionam
  { path: 'produtos/:slug', redirectTo: 'produto/:slug' },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/login/registro').then((m) => m.Registro),
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./features/carrinho/carrinho').then((m) => m.Carrinho),
  },
  {
    path: 'checkout',
    component: Checkout,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard],
  },
  // página 404 (com joguinho). Fica por último: qualquer endereço que não existe cai aqui.
  { path: '404', component: NaoEncontrado },
  { path: '**', component: NaoEncontrado },
];