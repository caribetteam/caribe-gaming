import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
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

  readonly erroSincronizacao = signal<string | null>(null);

  itens = this.carrinhoService.itens;
  quantidade = this.carrinhoService.quantidade;
  total = this.carrinhoService.total;
  carrinhoVazio = this.carrinhoService.carrinhoVazio;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.usuarioAtual$.subscribe((usuario) => {
        const trocouUsuario = this.userId() !== usuario?.id;
        this.userId.set(usuario?.id ?? null);
        this.erroSincronizacao.set(null);

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
    if (this.isUuid(produto.id)) {
      this.sincronizarItem(produto.id, this.obterQuantidade(produto.id));
    }
  }

  aumentarQuantidade(indice: number): void {
    const item = this.itens()[indice];
    if (!item) {
      return;
    }

    this.carrinhoService.aumentarQuantidade(indice);
    if (this.isUuid(item.id)) {
      this.atualizarQuantidadeNaApi(item.id, this.obterQuantidade(item.id));
    }
  }

  diminuirQuantidade(indice: number): void {
    const item = this.itens()[indice];
    if (!item || (item.quantidade ?? 1) <= 1) {
      return;
    }

    this.carrinhoService.diminuirQuantidade(indice);
    if (this.isUuid(item.id)) {
      this.atualizarQuantidadeNaApi(item.id, this.obterQuantidade(item.id));
    }
  }

  removerItem(indice: number): void {
    const item = this.itens()[indice];
    this.carrinhoService.removerPorIndice(indice);

    if (item && this.isUuid(item.id)) {
      this.executarRequisicao(
        this.http.delete<void>(`${environment.backendUrl}/api/cart/items/${item.id}`),
        'Não foi possível remover o item do carrinho na nuvem.',
      ).subscribe();
    }
  }

  limparCarrinho(): void {
    this.carrinhoService.limpar();

    if (this.userId()) {
      this.executarRequisicao(
        this.http.delete<void>(`${environment.backendUrl}/api/cart`),
        'Não foi possível limpar o carrinho na nuvem.',
      ).subscribe();
    }
  }

  private carregarCarrinhoDaApi(): void {
    this.executarRequisicao(
      this.http.get<CartResponse>(`${environment.backendUrl}/api/cart`),
      'Não foi possível carregar o carrinho da nuvem.',
    ).subscribe({
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
    });
  }

  private sincronizarItem(productId: string, quantity: number): void {
    this.executarRequisicao(
      this.http.post(`${environment.backendUrl}/api/cart/items`, {
        productId,
        quantity,
      }),
      'Não foi possível adicionar o item ao carrinho na nuvem.',
    ).subscribe();
  }

  private atualizarQuantidadeNaApi(productId: string, quantity: number): void {
    this.executarRequisicao(
      this.http.patch(`${environment.backendUrl}/api/cart/items/${productId}`, { quantity }),
      'Não foi possível atualizar a quantidade na nuvem.',
    ).subscribe();
  }

  private obterQuantidade(productId: string): number {
    return this.itens().find((item) => String(item.id) === productId)?.quantidade ?? 1;
  }

  private executarRequisicao<T>(request: Observable<T>, mensagem: string) {
    return request.pipe(
      catchError((error) => {
        this.erroSincronizacao.set(mensagem);
        console.error(mensagem, error);
        return throwError(() => error);
      }),
    );
  }

  private isUuid(value: ItemCarrinho['id']): value is string {
    return (
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    );
  }
}
