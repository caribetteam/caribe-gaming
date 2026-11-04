import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import { Produto } from './produtos.service';

const CHAVE_STORAGE = 'caribes-gaming-favoritos';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface FavoriteApi {
  product_id: string;
  created_at: string;
  products: {
    slug: string;
    name: string;
    image_url: string | null;
    price_cents: number;
  } | null;
}

interface FavoritesResponse {
  items: FavoriteApi[];
}

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private usuarioLogado = false;
  private usuarioSincronizadoId: string | null = null;

  private favoritosSubject = new BehaviorSubject<Produto[]>([]);
  favoritos$ = this.favoritosSubject.asObservable();

  constructor() {
    if (this.isBrowser) {
      this.favoritosSubject.next(this.carregarDoStorage());
    }

    this.authService.usuarioAtual$.subscribe((usuario) => {
      this.usuarioLogado = !!usuario;
      if (usuario) {
        if (this.isBrowser && this.usuarioSincronizadoId !== usuario.id) {
          this.usuarioSincronizadoId = usuario.id;
          this.sincronizarComServidor();
        }
      } else if (this.isBrowser) {
        this.usuarioSincronizadoId = null;
        this.favoritosSubject.next(this.carregarDoStorage());
      }
    });
  }

  private carregarDoStorage(): Produto[] {
    if (!this.isBrowser) return [];
    
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  }

  private salvarNoStorage(lista: Produto[]) {
    if (this.isBrowser) {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
    }
  }

  ehFavorito(produtoId: string): boolean {
    return this.favoritosSubject.value.some(p => p.id === produtoId);
  }

  // Método flexível para aceitar tanto a interface completa de Produto quanto objetos parciais das telas de detalhes
  toggleFavorito(produto: Produto | { id: string; nome: string; imagem: string; [key: string]: any }) {
    const listaAtual = this.favoritosSubject.value;
    const jaExiste = listaAtual.some(p => p.id === produto.id);

    const novaLista = jaExiste
      ? listaAtual.filter(p => p.id !== produto.id)
      : [...listaAtual, produto as Produto];

    this.favoritosSubject.next(novaLista);

    if (!this.usuarioLogado) {
      this.salvarNoStorage(novaLista);
      return;
    }

    if (!this.ehIdUuid(produto.id)) {
      console.error('Favorito não sincronizado: o produto não possui UUID.', produto.id);
      return;
    }

    const request: Observable<unknown> = jaExiste
      ? this.http.delete<void>(this.urlFavorito(produto.id))
      : this.http.post(`${environment.backendUrl}/api/favorites`, { productId: produto.id });

    request.pipe(
      catchError((error) => {
        console.error('Não foi possível sincronizar o favorito.', error);
        this.favoritosSubject.next(listaAtual);
        return of(null);
      }),
    ).subscribe();
  }

  limparTodosFavoritos(): void {
    const favoritos = this.favoritosSubject.value;
    this.favoritosSubject.next([]);

    if (!this.usuarioLogado) {
      this.salvarNoStorage([]);
      return;
    }

    const requests = favoritos
      .filter((produto) => this.ehIdUuid(produto.id))
      .map((produto) =>
        this.http.delete<void>(this.urlFavorito(produto.id)).pipe(
          catchError((error) => {
            console.error('Não foi possível remover o favorito.', error);
            return of(null);
          }),
        ),
      );

    if (requests.length > 0) {
      forkJoin(requests).subscribe();
    }
  }

  obterFavoritos(): Produto[] {
    return this.favoritosSubject.value;
  }

  private sincronizarComServidor(): void {
    const locais = this.favoritosSubject.value;
    const locaisSemUuid = locais.filter((produto) => !this.ehIdUuid(produto.id));
    const envios = locais
      .filter((produto) => this.ehIdUuid(produto.id))
      .map((produto) =>
        this.http.post(`${environment.backendUrl}/api/favorites`, { productId: produto.id }).pipe(
          catchError((error) => {
            console.error('Não foi possível enviar o favorito local.', error);
            return of(null);
          }),
        ),
      );

    const carregamento = envios.length > 0 ? forkJoin(envios) : of([]);
    carregamento.subscribe(() => {
      this.http.get<FavoritesResponse>(`${environment.backendUrl}/api/favorites`).pipe(
        map((response) => response.items.map((item) => this.mapearFavorito(item))),
        catchError((error) => {
          console.error('Não foi possível carregar os favoritos remotos.', error);
          return of(this.favoritosSubject.value);
        }),
        ).subscribe((favoritos) => {
          const ids = new Set(favoritos.map((favorito) => favorito.id));
          this.favoritosSubject.next([
            ...favoritos,
            ...locaisSemUuid.filter((produto) => !ids.has(produto.id)),
          ]);
        });
    });
  }

  private mapearFavorito(item: FavoriteApi): Produto {
    const produto = item.products;
    const preco = produto ? produto.price_cents / 100 : 0;
    return {
      id: item.product_id,
      nome: produto?.name ?? 'Produto favorito',
      imagem: produto?.image_url ?? undefined,
      imagemPosicao: 'center',
      precoOriginal: preco === 0 ? 'Grátis' : this.formatarPreco(preco),
      precoPromocional: preco === 0 ? 'Grátis' : this.formatarPreco(preco),
      desconto: 0,
      genero: '',
      plataforma: '',
      categorias: [],
      slug: produto?.slug ?? '',
    };
  }

  private formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  }

  private ehIdUuid(id: string): boolean {
    return UUID_PATTERN.test(id);
  }

  private urlFavorito(productId: string): string {
    return `${environment.backendUrl}/api/favorites/${encodeURIComponent(productId)}`;
  }
}