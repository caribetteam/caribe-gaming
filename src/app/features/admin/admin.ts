import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AuthFacade } from '../../core/facades/auth.facade';
import { AdminDataService } from '../../core/services/admin-data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  authFacade = inject(AuthFacade);
  private adminDataService = inject(AdminDataService);

  produtosCadastrados = signal(0);
  pedidosPendentes = signal(0);
  usuariosCadastrados = signal(0);

  constructor() {
    this.adminDataService.obterResumo().subscribe({
      next: (resumo) => {
        this.produtosCadastrados.set(resumo.products);
        this.pedidosPendentes.set(resumo.pendingOrders);
        this.usuariosCadastrados.set(resumo.users);
      },
      error: (error) => {
        console.error('Não foi possível carregar o resumo administrativo.', error);
      },
    });
  }

  sair() {
    this.authFacade.sair();
  }
}
