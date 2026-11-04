import {
  Component,
  inject,
  ViewEncapsulation,
  ElementRef,
  HostListener
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthFacade } from '../../core/facades/auth.facade';
import { ProdutosService } from '../../core/services/produtos.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class Header {

  authFacade = inject(AuthFacade);
  produtosService = inject(ProdutosService);
  router = inject(Router);

  menuAberto = false;
  menuUsuarioAberto = false;

  termoPesquisa = '';
  mostrarSugestoes = false;
  produtosFiltrados: any[] = [];

  constructor(private elementRef: ElementRef) {}

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

    const termo = this.termoPesquisa
      .trim()
      .toLowerCase();

    if (!termo) {
      this.produtosFiltrados = [];
      this.mostrarSugestoes = false;
      return;
    }

    this.produtosFiltrados =
      this.produtosService.listaProdutos
        .filter(produto => {

          const nome =
            produto.nome?.toLowerCase() || '';

          const slug =
            produto.slug?.toLowerCase() || '';

          return (
            nome.includes(termo) ||
            slug.includes(termo)
          );
        })
        .slice(0, 6);

    this.mostrarSugestoes =
      this.produtosFiltrados.length > 0;
  }


  // ==========================
  // SELECIONAR JOGO
  // ==========================

  selecionarJogo(produto: any) {

    this.termoPesquisa = produto.nome;

    this.mostrarSugestoes = false;

    const rota = this.obterRotaJogo(produto);

    this.router.navigateByUrl(rota);
  }


  // ==========================
  // ROTAS DOS JOGOS
  // ==========================

  obterRotaJogo(produto: any): string {

    return `/produto/${encodeURIComponent(produto.slug)}`;
  }


  // ==========================
  // CLIQUE FORA
  // ==========================

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: Event) {

    if (
      !this.elementRef.nativeElement.contains(
        event.target
      )
    ) {

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