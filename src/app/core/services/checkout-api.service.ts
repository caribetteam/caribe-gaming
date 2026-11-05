import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemCarrinho } from '../models/item-carrinho';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: 'pix' | 'cartao' | 'boleto';
  idempotencyKey: string;
  customer: {
    name: string;
    email: string;
    cpfCnpj: string;
  };
}

export interface CreatedOrder {
  id: string;
  status: string;
  total_cents: number;
  payment_method: string;
  asaas_payment_id: string | null;
}

@Injectable({ providedIn: 'root' })
export class CheckoutApiService {
  private readonly http = inject(HttpClient);

  criarPedido(
    itens: ItemCarrinho[],
    paymentMethod: CreateOrderRequest['paymentMethod'],
    customer: CreateOrderRequest['customer'],
    idempotencyKey: string,
  ): Observable<{ order: CreatedOrder }> {
    const items = itens.map((item) => ({
      productId: String(item.id),
      quantity: item.quantidade ?? 1,
    }));

    return this.http.post<{ order: CreatedOrder }>(`${environment.backendUrl}/api/orders`, {
      items,
      paymentMethod,
      idempotencyKey,
      customer,
    } satisfies CreateOrderRequest);
  }
}