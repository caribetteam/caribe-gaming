import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Produto {
  id: string;
  nome: string;
  steamAppId?: string;
  genero: string;
  plataforma: string;
  precoOriginal: string;
  precoPromocional: string;
  desconto: number;
  categorias: string[];
  slug: string;
  imagem?: string;
  imagemPosicao?: string;
  descricaoCustom?: string;
}

interface ProdutoApi {
  id: string;
  slug: string;
  name: string;
  steam_app_id: number | null;
  price_cents: number;
  currency: string;
  category: string | null;
  platform: string;
  image_url: string | null;
  active: boolean;
}

interface ProdutosResponse {
  products: ProdutoApi[];
}

interface ProdutoResponse {
  product: ProdutoApi;
}

type ItemCatalogo = {
  id: string;
  nome: string;
  steamAppId?: string;
  imagemCustom?: string;
  imagemPosicao?: string;
  genero: string;
  plat: string;
  orig: string;
  promo: string;
  desc: number;
  categorias: string[];
  slug: string;
  descricaoCustom?: string;
};

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private readonly http = inject(HttpClient);

  readonly listaProdutos: ItemCatalogo[] = [
    { id: '1', nome: 'Grand Theft Auto V', steamAppId: '271590', genero: 'Ação / Mundo Aberto', plat: 'PC', orig: 'R$ 149,90', promo: 'R$ 74,95', desc: 50, categorias: ['mundo-aberto'], slug: 'grand-theft-auto-v' },
    { id: '2', nome: 'The Witcher 3: Wild Hunt', steamAppId: '292030', genero: 'RPG / Mundo Aberto', plat: 'PC / PS5', orig: 'R$ 129,99', promo: 'R$ 129,99', desc: 0, categorias: ['rpg'], slug: 'the-witcher-3-wild-hunt' },
    { id: '3', nome: 'The Sims 4', steamAppId: '1222670', genero: 'Simulação', plat: 'PC', orig: 'Grátis', promo: 'Grátis', desc: 0, categorias: ['simulacao'], slug: 'the-sims-4' },
    { id: '4', nome: 'God of War', steamAppId: '1593500', genero: 'Ação / Aventura', plat: 'PC / PS5', orig: 'R$ 199,90', promo: 'R$ 199,90', desc: 0, categorias: ['acao'], slug: 'god-of-war-4' },
    { id: '5', nome: 'Marvel\'s Spider-Man Remastered', steamAppId: '1817070', genero: 'Ação / Aventura', plat: 'PC / PS5', orig: 'R$ 349,90', promo: 'R$ 199,90', desc: 42, categorias: ['mundo-aberto'], slug: 'marvels-spider-man-remastered' },
    { id: '6', nome: 'Call of Duty: Modern Warfare II', steamAppId: '1938090', genero: 'Tiro / FPS', plat: 'PC', orig: 'R$ 299,00', promo: 'R$ 299,00', desc: 0, categorias: ['acao'], slug: 'call-of-duty-modern-warfare-ii-2022' },
    { id: '7', nome: 'A Plague Tale: Innocence', steamAppId: '752590', genero: 'Aventura / Mistério', plat: 'PC', orig: 'R$ 229,00', promo: 'R$ 91,60', desc: 60, categorias: ['aventura'], slug: 'a-plague-tale-innocence' },
    { id: '8', nome: 'God of War Ragnarök', steamAppId: '2322010', genero: 'Ação / Aventura', plat: 'PC / PS5', orig: 'R$ 249,90', promo: 'R$ 249,90', desc: 0, categorias: ['acao'], slug: 'god-of-war-ragnarok' },
    { id: '9', nome: 'Hollow Knight', steamAppId: '367520', genero: 'Metroidvania', plat: 'PC', orig: 'R$ 46,99', promo: 'R$ 46,99', desc: 0, categorias: ['acao'], slug: 'hollow-knight' },
    { id: '10', nome: 'Red Dead Redemption 2', steamAppId: '1174180', genero: 'Ação / Mundo Aberto', plat: 'PC / PS5', orig: 'R$ 299,90', promo: 'R$ 98,96', desc: 67, categorias: ['mundo-aberto'], slug: 'red-dead-redemption-2' },
    { id: '11', nome: 'Assassin’s Creed IV Black Flag', steamAppId: '242050', genero: 'Ação', plat: 'PC', orig: 'R$ 119,99', promo: 'R$ 119,99', desc: 0, categorias: ['mundo-aberto'], slug: 'assassins-creed-iv-black-flag' },
    { id: '12', nome: 'Yakuza 0', steamAppId: '638970', genero: 'Ação / Luta', plat: 'PC', orig: 'R$ 83,50', promo: 'R$ 83,50', desc: 0, categorias: ['mundo-aberto'], slug: 'yakuza-0' },
    { id: '13', nome: 'EA Sports FC 24', steamAppId: '2195250', genero: 'Esportes', plat: 'PC / PS5', orig: 'R$ 350,00', promo: 'R$ 350,00', desc: 0, categorias: ['simulacao'], slug: 'ea-sports-fc-24' },
    { id: '14', nome: 'Life is Strange', steamAppId: '319630', genero: 'História Interativa', plat: 'PC', orig: 'R$ 99,00', promo: 'R$ 19,80', desc: 80, categorias: ['aventura'], slug: 'life-is-strange' },
    { id: '15', nome: 'The Last of Us Part I', steamAppId: '1888930', genero: 'Ação / Sobrevivência', plat: 'PC / PS5', orig: 'R$ 249,90', promo: 'R$ 249,90', desc: 0, categorias: ['aventura'], slug: 'the-last-of-us-part-i' },
    { id: '16', nome: 'F1 23', steamAppId: '2108330', genero: 'Corrida', plat: 'PC', orig: 'R$ 350,00', promo: 'R$ 143,60', desc: 60, categorias: ['simulacao'], slug: 'f1-23' },
    { id: '17', nome: 'Elden Ring', steamAppId: '1245620', genero: 'RPG / Souls-like', plat: 'PC / PS5', orig: 'R$ 229,90', promo: 'R$ 229,90', desc: 0, categorias: ['rpg'], slug: 'elden-ring' },
    { id: '18', nome: 'Cyberpunk 2077', steamAppId: '1091500', genero: 'RPG / Sci-Fi', plat: 'PC', orig: 'R$ 199,90', promo: 'R$ 99,95', desc: 50, categorias: ['rpg'], slug: 'cyberpunk-2077' },
    { id: '19', nome: 'Marvel Rivals', steamAppId: '2767030', genero: 'Hero Shooter', plat: 'PC', orig: 'Grátis', promo: 'Grátis', desc: 0, categorias: ['acao'], slug: 'marvel-rivals' },
    { id: '20', nome: 'The Last of Us Part II', steamAppId: '2531310', genero: 'Ação / Sobrevivência', plat: 'PS5', orig: 'R$ 249,90', promo: 'R$ 124,75', desc: 50, categorias: ['aventura'], slug: 'the-last-of-us-part-ii-remastered' },
    // ===== JOGOS NOVOS — só pra encher o catálogo (usam o componente único) =====
    
    
  ];

  obterProdutos(): Observable<Produto[]> {
    return this.http.get<ProdutosResponse>(`${environment.backendUrl}/api/products`).pipe(
      map((response) => response.products.map((produto) => this.mapearProdutoApi(produto))),
      catchError((error) => {
        console.error('Erro ao carregar produtos pela API; usando fixture local.', error);
        return of(this.mapearFixture());
      }),
    );
  }

  obterPorSlug(slug: string): Observable<Produto | undefined> {
    return this.http
      .get<ProdutoResponse>(
        `${environment.backendUrl}/api/products/${encodeURIComponent(slug)}`,
      )
      .pipe(
        map((response) => this.mapearProdutoApi(response.product)),
        catchError((error) => {
          console.error('Erro ao carregar produto pela API; usando fixture local.', error);
          return of(this.mapearFixture().find((produto) => produto.slug === slug));
        }),
      );
  }

  private mapearFixture(): Produto[] {
    return this.listaProdutos.map((item) => ({
      id: item.id,
      nome: item.nome,
      imagem: item.imagemCustom
        ? item.imagemCustom
        : `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.steamAppId}/library_600x900.jpg`,
      imagemPosicao: item.imagemPosicao ?? 'center',
      precoOriginal: item.orig,
      precoPromocional: item.promo,
      desconto: item.desc,
      genero: item.genero,
      plataforma: item.plat,
      categorias: item.categorias,
      slug: item.slug,
      steamAppId: item.steamAppId,
    }));
  }

  private mapearProdutoApi(produto: ProdutoApi): Produto {
    const preco = this.formatarPreco(produto.price_cents, produto.currency);
    return {
      id: produto.id,
      nome: produto.name,
      imagem:
        produto.image_url ??
        (produto.steam_app_id
          ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${produto.steam_app_id}/library_600x900.jpg`
          : undefined),
      imagemPosicao: 'center',
      precoOriginal: preco,
      precoPromocional: preco,
      desconto: 0,
      genero: produto.category ?? '',
      plataforma: produto.platform,
      categorias: produto.category ? [produto.category] : [],
      slug: produto.slug,
      steamAppId: produto.steam_app_id?.toString(),
    };
  }

  private formatarPreco(priceCents: number, currency: string): string {
    if (priceCents === 0) {
      return 'Grátis';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(priceCents / 100);
  }
}