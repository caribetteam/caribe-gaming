import {
  Component,
  inject,
  ViewEncapsulation,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  signal,
  afterNextRender,
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthFacade } from '../../core/facades/auth.facade';
import { CarrinhoFacade } from '../../core/facades/carrinho.facade';
import { ProdutosService } from '../../core/services/produtos.service';
import { Produto } from '../../core/models/jogo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class Header {
  authFacade = inject(AuthFacade);
  carrinhoFacade = inject(CarrinhoFacade);
  produtosService = inject(ProdutosService);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  menuAberto = false;
  menuUsuarioAberto = false;

  termoPesquisa = '';
  mostrarSugestoes = false;
  produtosFiltrados: Produto[] = [];

  // Contador do carrinho
  badgeVisivel = signal(false); // só liga no navegador, para o servidor e o navegador começarem iguais
  badgePulando = signal(false);
  private quantidadeAnterior = this.carrinhoFacade.quantidade();
  private timerBadge: any;

  constructor(private elementRef: ElementRef) {
    afterNextRender(() => this.badgeVisivel.set(true));

    // Toda vez que a quantidade AUMENTA, o número dá um pulinho
    effect(() => {
      const quantidade = this.carrinhoFacade.quantidade();
      if (quantidade > this.quantidadeAnterior) this.animarBadge();
      this.quantidadeAnterior = quantidade;
    });
  }

  private animarBadge(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    clearTimeout(this.timerBadge);
    this.badgePulando.set(false);

    // pequeno atraso para a animação reiniciar mesmo com vários cliques seguidos
    setTimeout(() => {
      this.badgePulando.set(true);
      this.timerBadge = setTimeout(() => this.badgePulando.set(false), 450);
    }, 20);
  }

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu() {
    this.menuAberto = false;
  }

  toggleMenuUsuario() {
    this.menuUsuarioAberto = !this.menuUsuarioAberto;
  }

  // ==========================
  // PESQUISA
  // ==========================
  pesquisar() {
    const termo = this.termoPesquisa.trim();

    if (!termo) {
      this.produtosFiltrados = [];
      this.mostrarSugestoes = false;
      return;
    }

    this.produtosFiltrados = this.produtosService.buscarNoCatalogo(termo, 6);
    this.mostrarSugestoes = true; // sem resultado, o menu mostra "Nenhum jogo encontrado"
  }

  // ==========================
  // SELECIONAR JOGO
  // ==========================
  selecionarJogo(produto: Produto) {
    this.termoPesquisa = produto.nome;
    this.mostrarSugestoes = false;
    this.fecharMenu();
    this.router.navigate(['/produto', produto.id]);
  }

  // ==========================
  // CLIQUE FORA
  // ==========================
  @HostListener('document:click', ['$event'])
  aoClicarFora(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuUsuarioAberto = false;
      this.mostrarSugestoes = false;
    }
  }

  // ==========================
  // SAIR
  // ==========================
  sair() {
    this.authFacade.sair();
    this.menuUsuarioAberto = false;
    this.fecharMenu();
  }
}