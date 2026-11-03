import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemCarrinho } from '../models/item-carrinho';
import { AuthService } from '../services/auth';
import { CarrinhoService } from '../services/carrinho.service';

interface CartResponse {
  items: Array<{
    product_id: string;
    quantity: number;
    products: {
      name: string;
      image_url: string | null;
      price_cents: number;
    } | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoFacade {
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userId = signal<string | null>(null);

  itens = this.carrinhoService.itens;
  quantidade = this.carrinhoService.quantidade;
  total = this.carrinhoService.total;
  carrinhoVazio = this.carrinhoService.carrinhoVazio;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.usuarioAtual$.subscribe((usuario) => {
        const trocouUsuario = this.userId() !== usuario?.id;
        this.userId.set(usuario?.id ?? null);
        if (!trocouUsuario) {
          return;
        }
        if (usuario) {
          this.carregarCarrinhoDaApi();
        } else {
          this.carrinhoService.limpar();
        }
      });
    }
  }

  adicionarProduto(produto: ItemCarrinho): void {
    this.carrinhoService.adicionar(produto);
    this.sincronizarItem(produto);
  }

  aumentarQuantidade(indice: number): void {
    const item = this.itens()[indice];
    this.carrinhoService.aumentarQuantidade(indice);
    if (item) {
      this.sincronizarItem({ ...item, quantidade: (item.quantidade ?? 1) + 1 });
    }
  }

  diminuirQuantidade(indice: number): void {
    const item = this.itens()[indice];
    this.carrinhoService.diminuirQuantidade(indice);
    if (item && (item.quantidade ?? 1) > 1) {
      this.sincronizarItem({ ...item, quantidade: (item.quantidade ?? 1) - 1 });
    }
  }

  removerItem(indice: number): void {
    const item = this.itens()[indice];
    this.carrinhoService.removerPorIndice(indice);
    if (item) {
      this.removerItemDaApi(item);
    }
  }

  limparCarrinho(): void {
    this.carrinhoService.limpar();
    if (this.userId()) {
      this.requestWithToken('delete', '/api/cart').subscribe({
        error: (error) => console.error('Erro ao limpar carrinho na API', error),
      });
    }
  }

  private carregarCarrinhoDaApi(): void {
    this.requestWithToken<CartResponse>('get', '/api/cart').subscribe({
      next: (response) => {
        this.carrinhoService.definirItens(
          response.items
            .filter((item) => item.products)
            .map((item) => ({
              id: item.product_id,
              nome: item.products!.name,
              preco: item.products!.price_cents / 100,
              quantidade: item.quantity,
              imagemUrl: item.products!.image_url ?? undefined,
            })),
        );
      },
      error: (error) => console.error('Erro ao carregar carrinho da API', error),
    });
  }

  private sincronizarItem(item: ItemCarrinho): void {
    if (!this.userId() || !this.isUuid(item.id)) {
      return;
    }
    this.requestWithToken('post', '/api/cart/items', {
      productId: item.id,
      quantity: item.quantidade ?? 1,
    }).subscribe({
      error: (error) => console.error('Erro ao sincronizar item do carrinho', error),
    });
  }

  private removerItemDaApi(item: ItemCarrinho): void {
    if (!this.userId() || !this.isUuid(item.id)) {
      return;
    }
    this.requestWithToken('delete', `/api/cart/items/${item.id}`).subscribe({
      error: (error) => console.error('Erro ao remover item do carrinho na API', error),
    });
  }

  private requestWithToken<T>(method: 'get' | 'post' | 'delete', path: string, body?: object) {
    return from(this.authService.obterAccessToken()).pipe(
      switchMap((token) => {
        if (!token) {
          throw new Error('No Supabase access token available.');
        }
        const options = { headers: { Authorization: `Bearer ${token}` } };
        if (method === 'get') {
          return this.http.get<T>(`${environment.backendUrl}${path}`, options);
        }
        if (method === 'post') {
          return this.http.post<T>(`${environment.backendUrl}${path}`, body, options);
        }
        return this.http.delete<T>(`${environment.backendUrl}${path}`, options);
      }),
      catchError((error) => {
        console.error(`Cart API request failed: ${method.toUpperCase()} ${path}`, error);
        return throwError(() => error);
      }),
    );
  }

  private isUuid(value: ItemCarrinho['id']): value is string {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
