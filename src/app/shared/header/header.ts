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
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

import { AuthFacade } from '../../core/facades/auth.facade';
import { CarrinhoFacade } from '../../core/facades/carrinho.facade';
import { ProdutosService, semAcento } from '../../core/services/produtos.service';
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

  // Pesquisa
  termoPesquisa = '';
  mostrarSugestoes = false;
  sugestoes: Produto[] = [];
  totalResultados = 0;
  indiceAtivo = -1; // item destacado pelas setas do teclado
  erroBusca = false;
  private precos = new Map<string, Produto>(); // preços ao vivo, preenchidos no 1º foco
  private precosCarregados = false;
  private timerAoVivo: any;

  // Contador do carrinho
  badgeVisivel = signal(false); // só liga no navegador, para o servidor e o navegador começarem iguais
  badgePulando = signal(false);
  private quantidadeAnterior = this.carrinhoFacade.quantidade();
  private timerBadge: any;

  constructor(private elementRef: ElementRef) {
    // Mantém o campo igual ao endereço quando estamos em /jogos?busca=...
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (!this.estaNaListaDeJogos()) return;
        const busca = this.router.parseUrl(this.router.url).queryParams['busca'] ?? '';
        if (busca !== this.termoPesquisa.trim()) this.termoPesquisa = busca;
      });

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
  pesquisar(): void {
    const termo = this.termoPesquisa.trim();
    this.indiceAtivo = -1;

    if (!termo) {
      this.sugestoes = [];
      this.totalResultados = 0;
      this.erroBusca = false;
      this.mostrarSugestoes = false;
      this.atualizarListaAoVivo('');
      return;
    }

    try {
      const r = this.produtosService.buscarCatalogo(termo, 6);
      this.sugestoes = r.itens;
      this.totalResultados = r.total;
      this.erroBusca = false;
    } catch (e) {
      console.error('Erro na pesquisa:', e);
      this.sugestoes = [];
      this.totalResultados = 0;
      this.erroBusca = true;
    }

    this.mostrarSugestoes = true; // sem resultado, o menu mostra "Nenhum jogo encontrado"
    this.carregarPrecos();
    this.atualizarListaAoVivo(termo);
  }

  // Estando na página de jogos, o catálogo muda enquanto a pessoa digita
  private atualizarListaAoVivo(termo: string): void {
    if (!this.estaNaListaDeJogos()) return;
    clearTimeout(this.timerAoVivo);
    this.timerAoVivo = setTimeout(() => {
      this.router.navigate(['/jogos'], {
        queryParams: { busca: termo || null },
        replaceUrl: true,
      });
    }, 300);
  }

  private estaNaListaDeJogos(): boolean {
    return this.router.url.split('?')[0].split('#')[0] === '/jogos';
  }

  // Enter sem escolher ninguém / clique na lupa: abre a lista de jogos filtrada
  buscarTudo(): void {
    const termo = this.termoPesquisa.trim();
    if (!termo) return;
    clearTimeout(this.timerAoVivo);
    this.mostrarSugestoes = false;
    this.fecharMenu();
    this.router.navigate(['/jogos'], { queryParams: { busca: termo } });
  }

  // Setas, Enter e Esc dentro do campo
  aoTeclar(event: KeyboardEvent): void {
    const total = this.sugestoes.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.mostrarSugestoes) {
          this.pesquisar();
          return;
        }
        if (total) this.indiceAtivo = (this.indiceAtivo + 1) % total;
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (total) this.indiceAtivo = this.indiceAtivo <= 0 ? total - 1 : this.indiceAtivo - 1;
        break;

      case 'Enter':
        event.preventDefault();
        if (this.mostrarSugestoes && this.indiceAtivo >= 0 && this.sugestoes[this.indiceAtivo]) {
          this.selecionarJogo(this.sugestoes[this.indiceAtivo]);
        } else {
          this.buscarTudo();
        }
        break;

      case 'Escape':
        this.mostrarSugestoes = false;
        this.indiceAtivo = -1;
        break;
    }
  }

  // Preços ao vivo: busca a lista uma vez (a Steam já devolve com cache) só para mostrar o valor
  private carregarPrecos(): void {
    if (this.precosCarregados || !isPlatformBrowser(this.platformId)) return;
    this.precosCarregados = true;

    this.produtosService
      .obterProdutos()
      .pipe(take(1))
      .subscribe({
        next: (lista) => lista.forEach((p) => this.precos.set(p.id, p)),
        error: () => (this.precosCarregados = false), // tenta de novo no próximo foco
      });
  }

  precoDe(produto: Produto): Produto | undefined {
    return this.precos.get(produto.id);
  }

  // Quebra o nome em pedaços para destacar a parte que a pessoa digitou
  partesNome(nome: string): { texto: string; destaque: boolean }[] {
    const termo = this.termoPesquisa.trim();
    if (!termo) return [{ texto: nome, destaque: false }];

    const n = semAcento(nome);
    const q = semAcento(termo);
    const i = n.indexOf(q);
    if (i < 0 || n.length !== nome.length) return [{ texto: nome, destaque: false }];

    return [
      { texto: nome.slice(0, i), destaque: false },
      { texto: nome.slice(i, i + q.length), destaque: true },
      { texto: nome.slice(i + q.length), destaque: false },
    ].filter((p) => p.texto);
  }

  // Foto da sugestão: tenta a capa vertical; se falhar, a horizontal; se falhar, mostra o ícone
  imagemSugestaoFalhou(event: Event, produto: Produto): void {
    const img = event.target as HTMLImageElement;
    if (!img.dataset['tentou']) {
      img.dataset['tentou'] = '1';
      img.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${produto.id}/header.jpg`;
      return;
    }
    img.style.display = 'none';
    img.parentElement?.classList.add('sem-foto');
  }

  // ==========================
  // SELECIONAR JOGO
  // ==========================
  selecionarJogo(produto: Produto): void {
    clearTimeout(this.timerAoVivo);
    this.termoPesquisa = produto.nome;
    this.mostrarSugestoes = false;
    this.fecharMenu();
    this.router.navigate(['/produto', produto.slug ?? produto.id]);
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