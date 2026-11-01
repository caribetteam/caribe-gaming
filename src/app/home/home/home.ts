import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { Header } from '../../shared/header/header';
import { CarrinhoFacade } from '../../core/facades/carrinho.facade';
import { JogosApiService } from '../../core/services/jogos-api.service';
import { JogoCard } from '../../core/models/jogo';
import { LoaderBarco } from '../../features/produtos/carregamento/cacrregamento-barco';

interface GameItem {
  id: number;
  title: string;
  subtitle: string;
  originalPrice: string;
  promoPrice: string;
  discount: string; // vazio quando o jogo não está em promoção
  priceValue: number;
  badge?: string;
  image: string; // banner (usado só no destaque)
  horizontal: string; // imagem horizontal dos cards
  capa: string; // capa vertical (usada no carrinho)
  plataforma: string;
}

interface DetalheDestaque {
  descricao: string;
  screenshot: string | null;
  header: string | null;
}

const BADGES_DESTAQUE = ['OFERTA DO DIA', 'DESTAQUE DA SEMANA', 'EM PROMOÇÃO'];

// Arte larga da Steam (sem texto). Em jogos novos pode não existir; aí entra a screenshot.
const bannerSteam = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_hero.jpg`;

// Imagem horizontal dos cards. Em jogos novos pode não existir; aí entra a da API.
const horizontalSteam = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Header, LoaderBarco],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private carrinhoFacade = inject(CarrinhoFacade);
  private jogosApi = inject(JogosApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  carregado = false;
  activeHeroIndex = 0;
  private autoSlideTimer: any;

  heroGames: GameItem[] = [];
  offerGames: GameItem[] = [];

  private catalogo: JogoCard[] = [];
  private detalhesDestaque = new Map<number, DetalheDestaque>();
  private bannerFalhou$ = new Set<number>();

  get heroAtual(): GameItem | undefined {
    return this.heroGames[this.activeHeroIndex];
  }

  ngOnInit() {
    // No servidor (SSR) não busca nada nem liga timers: o navegador faz isso depois.
    if (!isPlatformBrowser(this.platformId)) return;

    this.startAutoSlide();

    // A lista chega de novo a cada 5 min (preços atualizados na Steam)
    this.jogosApi
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.catalogo = lista;
          this.montarHome();
        },
        error: (err) => console.error('Erro ao carregar a Home:', err),
      });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  // --- MONTAGEM DOS DADOS ---
  private montarHome(): void {
    // só entram jogos com estoque e com preço (ou grátis)
    const disponiveis = this.catalogo.filter((j) => j.estoque && (j.preco || j.gratis));
    const desconto = (j: JogoCard) => j.preco?.desconto ?? 0;

    const emPromocao = disponiveis
      .filter((j) => desconto(j) > 0)
      .sort((a, b) => desconto(b) - desconto(a));
    const semPromocao = disponiveis.filter((j) => desconto(j) === 0);
    const ordem = [...emPromocao, ...semPromocao];

    const destaques = ordem.slice(0, 3);
    const idsDestaque = new Set(destaques.map((j) => j.id));
    // com poucas promoções, completa as ofertas com os outros jogos
    const baseOfertas = emPromocao.length >= 4 ? emPromocao : ordem;

    this.heroGames = destaques.map((j, i) => this.paraDestaque(j, i));
    this.offerGames = baseOfertas
      .filter((j) => !idsDestaque.has(j.id))
      .slice(0, 10)
      .map((j) => this.paraItem(j));

    if (this.activeHeroIndex >= this.heroGames.length) this.activeHeroIndex = 0;

    this.carregado = true;
    this.carregarDetalhesDestaque(destaques.map((j) => j.id));
    this.cdr.markForCheck();
  }

  private paraItem(j: JogoCard): GameItem {
    const desc = j.preco?.desconto ?? 0;
    return {
      id: j.id,
      title: j.nome,
      subtitle: j.generos.slice(0, 2).join(' / '),
      originalPrice: j.preco?.original ?? '',
      promoPrice: j.gratis ? 'Grátis' : (j.preco?.atual ?? ''),
      discount: desc > 0 ? `-${desc}%` : '',
      priceValue: j.gratis ? 0 : (j.preco?.valor ?? 0),
      image: j.capa,
      horizontal: horizontalSteam(j.id),
      capa: j.capa,
      plataforma: j.plataformas.join(' / ') || 'PC',
    };
  }

  private paraDestaque(j: JogoCard, indice: number): GameItem {
    const item = this.paraItem(j);
    const detalhe = this.detalhesDestaque.get(j.id);
    const emPromocao = (j.preco?.desconto ?? 0) > 0;

    return {
      ...item,
      badge: emPromocao ? (BADGES_DESTAQUE[indice] ?? 'EM PROMOÇÃO') : 'DESTAQUE',
      subtitle: detalhe?.descricao || item.subtitle,
      image: this.bannerDe(j.id),
    };
  }

  private bannerDe(id: number): string {
    if (!this.bannerFalhou$.has(id)) return bannerSteam(id);
    const d = this.detalhesDestaque.get(id);
    return d?.screenshot ?? d?.header ?? '';
  }

  // Descrição e screenshots só dos jogos do banner (ficam em cache, então a página do jogo abre mais rápido)
  private carregarDetalhesDestaque(ids: number[]): void {
    for (const id of ids) {
      if (this.detalhesDestaque.has(id)) continue;
      this.detalhesDestaque.set(id, { descricao: '', screenshot: null, header: null }); // marca como pedido

      this.jogosApi
        .obterJogo(String(id))
        .pipe(take(1))
        .subscribe({
          next: (d) => {
            this.detalhesDestaque.set(id, {
              descricao: this.resumir(d.descricao ?? ''),
              screenshot: d.imagens?.[1] ?? null, // [0] é a capa vertical
              header: d.background_image ?? null,
            });
            this.montarHome();
          },
          error: () => {},
        });
    }
  }

  private resumir(texto: string, max = 130): string {
    const doc = new DOMParser().parseFromString(texto, 'text/html');
    const limpo = (doc.documentElement.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (limpo.length <= max) return limpo;
    return limpo.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  // --- IMAGENS COM RESERVA ---

  // O banner largo não existe: passa para a screenshot (ou a imagem horizontal do jogo)
  bannerFalhou(id: number): void {
    if (this.bannerFalhou$.has(id)) return; // a reserva também falhou: para por aqui
    this.bannerFalhou$.add(id);
    this.montarHome();
  }

  // A imagem do card não existe: busca a certa na API da Steam
  imagemCardFalhou(event: Event, jogo: GameItem): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['reserva']) return; // já tentou a reserva uma vez
    img.dataset['reserva'] = '1';

    this.jogosApi.obterImagemHorizontal(jogo.id).subscribe((url) => {
      if (url) img.src = url;
    });
  }

  // --- NAVEGAÇÃO E COMPRA ---
  irParaPaginaDoJogo(jogo: GameItem): void {
    this.router.navigate(['/produto', jogo.id]);
  }

  comprarAgora(jogo: GameItem) {
    // sem preço válido não dá para comprar direto: abre a página do jogo
    if (jogo.priceValue <= 0 && jogo.promoPrice !== 'Grátis') {
      this.irParaPaginaDoJogo(jogo);
      return;
    }

    this.carrinhoFacade.adicionarProduto({
      id: jogo.id,
      nome: jogo.title,
      preco: jogo.priceValue,
      quantidade: 1,
      imagemUrl: jogo.capa,
      plataforma: jogo.plataforma,
      categoria: 'Jogo',
    });

    this.router.navigate(['/carrinho']);
  }

  // --- CARROSSEL DO BANNER ---
  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      this.nextHero();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = undefined;
    }
  }

  prevHero() {
    if (!this.heroGames.length) return;
    this.stopAutoSlide();
    this.activeHeroIndex =
      (this.activeHeroIndex - 1 + this.heroGames.length) % this.heroGames.length;
    this.startAutoSlide();
  }

  nextHero() {
    if (!this.heroGames.length) return;
    this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroGames.length;
  }

  selectHero(index: number) {
    this.stopAutoSlide();
    this.activeHeroIndex = index;
    this.startAutoSlide();
  }

  scrollOffers(container: HTMLDivElement, direction: 'left' | 'right') {
    const scrollAmount = direction === 'left' ? -320 : 320;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}