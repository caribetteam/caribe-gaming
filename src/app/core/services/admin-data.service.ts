import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminSummary {
  products: number;
  pendingOrders: number;
  users: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  platform: string;
  category: string | null;
  steam_app_id: number | null;
  price_cents: number;
  currency: string;
  active: boolean;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  payment_method: string;
  asaas_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  display_name: string | null;
  email: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendUrl}/api/admin`;

  obterResumo(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.baseUrl}/summary`);
  }

  obterProdutos(): Observable<{ products: AdminProduct[] }> {
    return this.http.get<{ products: AdminProduct[] }>(`${this.baseUrl}/products`);
  }

  criarProduto(product: Omit<AdminProduct, 'id'>): Observable<{ product: AdminProduct }> {
    return this.http.post<{ product: AdminProduct }>(`${this.baseUrl}/products`, product);
  }

  atualizarProduto(id: string, product: Partial<AdminProduct>): Observable<{ product: AdminProduct }> {
    return this.http.patch<{ product: AdminProduct }>(`${this.baseUrl}/products/${id}`, product);
  }

  desativarProduto(id: string): Observable<{ product: Pick<AdminProduct, 'id' | 'active'> }> {
    return this.http.delete<{ product: Pick<AdminProduct, 'id' | 'active'> }>(
      `${this.baseUrl}/products/${id}`,
    );
  }

  obterPedidos(): Observable<{ orders: AdminOrder[] }> {
    return this.http.get<{ orders: AdminOrder[] }>(`${this.baseUrl}/orders`);
  }

  atualizarStatusPedido(id: string, status: AdminOrder['status']): Observable<{ order: AdminOrder }> {
    return this.http.patch<{ order: AdminOrder }>(`${this.baseUrl}/orders/${id}/status`, { status });
  }

  obterUsuarios(): Observable<{ users: AdminUser[] }> {
    return this.http.get<{ users: AdminUser[] }>(`${this.baseUrl}/users`);
  }

  atualizarRoleUsuario(id: string, role: AdminUser['role']): Observable<{ user: AdminUser }> {
    return this.http.patch<{ user: AdminUser }>(`${this.baseUrl}/users/${id}/role`, { role });
  }
}