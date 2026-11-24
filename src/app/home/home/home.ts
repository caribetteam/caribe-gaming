import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  DestroyRef,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { slugDoAppid } from '../../core/utils/slug';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { Header } from '../../shared/header/header';
import { CarrinhoFacade } from '../../core/facades/carrinho.facade';
import { JogosApiService } from '../../core/services/jogos-api.service';
import { JogoCard } from '../../core/models/jogo';
import { LoaderBarco } from '../../features/produtos/carregamento/cacrregamento-barco';

import Swiper from 'swiper';
import {
  EffectFade,
  EffectCoverflow,
  EffectCards,
  Navigation,
  Pagination,
  Autoplay,
} from 'swiper/modules';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';

interface GameItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  generos: string[];
  originalPrice: string;
  promoPrice: string;
  discount: string;
  discountValue: number;
  priceValue: number;
  gratis: boolean;
  badge?: string;
  image: string;
  horizontal: string;
  capa: string;
  plataforma: string;
}

interface DetalheDestaque {
  descricao: string;
  screenshot: string | null;
  header: string | null;
}

interface CategoriaCard {
  nome: string;
  busca: string;
  descricao: string;
  icone: string;
  gradiente: string;
}

type AbaVitrine = 'alta' | 'descontos' | 'acessiveis' | 'gratis';

const BADGES_DESTAQUE = ['OFERTA DO DIA', 'DESTAQUE DA SEMANA', 'EM PROMOÇÃO'];
const STORAGE_VISTOS = 'caribes_vistos_recentemente';
const STORAGE_GENEROS = 'caribes_generos_interesse';

const bannerSteam = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_hero.jpg`;

const horizontalSteam = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, LoaderBarco],
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

  @ViewChild('heroSwiper') heroSwiperRef?: ElementRef<HTMLDivElement>;
  @ViewChild('offersEmbla') offersEmblaRef?: ElementRef<HTMLDivElement>;
  @ViewChild('recommendedSwiper') recommendedSwiperRef?: ElementRef<HTMLDivElement>;
  @ViewChild('recentSwiper') recentSwiperRef?: ElementRef<HTMLDivElement>;

  private swiperHero?: Swiper;
  private emblaOfertas?: EmblaCarouselType;
  private swiperRecomendados?: Swiper;
  private swiperRecentes?: Swiper;

  ofertasSnapCount = 0;
  ofertasSelectedIndex = 0;

  carregado = false;
  activeHeroIndex = 0;
  readonly AUTOPLAY_MS = 5000;
  private countdownTimer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private feedbackTimers = new Map<number, ReturnType<typeof setTimeout>>();

  tempoRestante = { horas: '00', minutos: '00', segundos: '00' };
  abaAtiva: AbaVitrine = 'alta';
  toastJogo: GameItem | null = null;

  heroGames: GameItem[] = [];
  offerGames: GameItem[] = [];
  flashDeals: GameItem[] = [];
  destaqueEspecial: GameItem | undefined;
  topRankingGames: GameItem[] = [];

  vitrineAlta: GameItem[] = [];
  vitrineDescontos: GameItem[] = [];
  vitrineAcessiveis: GameItem[] = [];
  vitrineGratis: GameItem[] = [];

  recommendedGames: GameItem[] = [];
  generoRecomendado = '';
  recentlyViewedGames: GameItem[] = [];

  adicionadoRecentemente = new Set<number>();

  readonly categorias: CategoriaCard[] = [
    {
      nome: 'Ação & Tiro',
      busca: 'Ação',
      descricao: 'Combate intenso e adrenalina',
      icone: '🎯',
      gradiente: 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
    {
      nome: 'RPG & Fantasia',
      busca: 'RPG',
      descricao: 'Mundos épicos e evolução',
      icone: '⚔️',
      gradiente: 'linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
    {
      nome: 'Aventura',
      busca: 'Aventura',
      descricao: 'Exploração e histórias marcantes',
      icone: '🧭',
      gradiente: 'linear-gradient(135deg, rgba(6, 95, 70, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
    {
      nome: 'Corrida & Esportes',
      busca: 'Corrida',
      descricao: 'Velocidade e competição',
      icone: '🏎️',
      gradiente: 'linear-gradient(135deg, rgba(159, 18, 57, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
    {
      nome: 'Estratégia',
      busca: 'Estratégia',
      descricao: 'Tática, gestão e conquista',
      icone: '♟️',
      gradiente: 'linear-gradient(135deg, rgba(146, 64, 14, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
    {
      nome: 'Indie',
      busca: 'Indie',
      descricao: 'Criatividade independente',
      icone: '🕹️',
      gradiente:
        'linear-gradient(135deg, rgba(14, 116, 144, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
  ];

  private catalogo: JogoCard[] = [];
  private detalhesDestaque = new Map<number, DetalheDestaque>();
  private bannerFalhou$ = new Set<number>();

  get jogosAbaAtual(): GameItem[] {
    switch (this.abaAtiva) {
      case 'descontos':
        return this.vitrineDescontos;
      case 'acessiveis':
        return this.vitrineAcessiveis;
      case 'gratis':
        return this.vitrineGratis;
      default:
        return this.vitrineAlta;
    }
  }

  get ofertasSnaps(): number[] {
    return Array.from({ length: this.ofertasSnapCount }, (_, i) => i);
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.iniciarContadorRelampago();

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
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.feedbackTimers.forEach((timer) => clearTimeout(timer));
    this.feedbackTimers.clear();

    this.swiperHero?.destroy(true, true);
    this.emblaOfertas?.destroy();
    this.swiperRecomendados?.destroy(true, true);
    this.swiperRecentes?.destroy(true, true);
  }

  // --- INICIALIZAÇÃO DOS CARROSSÉIS ---
  private inicializarCarrosseis(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // 1. Hero Banner (Swiper Effect Fade)
    if (this.heroSwiperRef?.nativeElement && this.heroGames.length > 0) {
      const indiceAtual = Math.min(this.activeHeroIndex, this.heroGames.length - 1);
      this.swiperHero?.destroy(true, true);

      this.swiperHero = new Swiper(this.heroSwiperRef.nativeElement, {
        modules: [EffectFade, Navigation, Pagination, Autoplay],
        spaceBetween: 30,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        loop: this.heroGames.length > 1,
        initialSlide: indiceAtual,
        autoplay: {
          delay: this.AUTOPLAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        navigation: {
          nextEl: '.hero-swiper-next',
          prevEl: '.hero-swiper-prev',
        },
        pagination: {
          el: '.hero-swiper-pagination',
          clickable: true,
        },
        on: {
          slideChange: (swiper) => {
            this.activeHeroIndex = swiper.realIndex;
            this.cdr.markForCheck();
          },
        },
      });
    }

    // 2. Ofertas Especiais (Embla Carousel Loop)
    this.inicializarEmblaOfertas();

    // 3. Coverflow 3D (Recomendados para Você)
    if (this.recommendedSwiperRef?.nativeElement && this.recommendedGames.length > 0) {
      this.swiperRecomendados?.destroy(true, true);
      const slideInicial = Math.min(2, Math.floor(this.recommendedGames.length / 2));

      this.swiperRecomendados = new Swiper(this.recommendedSwiperRef.nativeElement, {
        modules: [EffectCoverflow, Pagination],
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        initialSlide: slideInicial,
        coverflowEffect: {
          rotate: 35,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: true,
        },
        pagination: {
          el: '.recommended-pagination',
          clickable: true,
        },
      });
    }

    // 4. Effect Cards (Vistos Recentemente)
    if (this.recentSwiperRef?.nativeElement && this.recentlyViewedGames.length > 0) {
      this.swiperRecentes?.destroy(true, true);

      this.swiperRecentes = new Swiper(this.recentSwiperRef.nativeElement, {
        modules: [EffectCards],
        effect: 'cards',
        grabCursor: true,
      });
    }
  }

  private inicializarEmblaOfertas(): void {
    const rootNode = this.offersEmblaRef?.nativeElement;
    if (!rootNode || this.offerGames.length === 0) return;

    this.emblaOfertas?.destroy();
    const viewportNode = rootNode.querySelector<HTMLElement>('.embla__viewport');
    if (!viewportNode) return;

    this.emblaOfertas = EmblaCarousel(viewportNode, {
      loop: this.offerGames.length > 1,
      align: 'start',
      slidesToScroll: 1,
    });

    const atualizarEstado = (api: EmblaCarouselType) => {
      this.ofertasSnapCount = api.scrollSnapList().length;
      this.ofertasSelectedIndex = api.selectedScrollSnap();
      this.cdr.markForCheck();
    };

    atualizarEstado(this.emblaOfertas);

    this.emblaOfertas
      .on('init', atualizarEstado)
      .on('reInit', atualizarEstado)
      .on('select', atualizarEstado);
  }

  rolarOfertasEmbla(direction: 'prev' | 'next'): void {
    if (!this.emblaOfertas) return;
    if (direction === 'prev') {
      this.emblaOfertas.scrollPrev();
    } else {
      this.emblaOfertas.scrollNext();
    }
  }

  irParaOfertaSnap(index: number): void {
    this.emblaOfertas?.scrollTo(index);
  }

  // --- MONTAGEM DOS DADOS ---
  private montarHome(): void {
    const disponiveis = this.catalogo.filter((j) => j.estoque && (j.preco || j.gratis));
    const desconto = (j: JogoCard) => j.preco?.desconto ?? 0;

    const emPromocao = disponiveis
      .filter((j) => desconto(j) > 0)
      .sort((a, b) => desconto(b) - desconto(a));
    const semPromocao = disponiveis.filter((j) => desconto(j) === 0);
    const ordem = [...emPromocao, ...semPromocao];

    const destaques = ordem.slice(0, 3);
    const idsDestaque = new Set(destaques.map((j) => j.id));
    this.heroGames = destaques.map((j, i) => this.paraDestaque(j, i));

    const baseOfertas = emPromocao.length >= 4 ? emPromocao : ordem;
    const ofertasDisponiveis = baseOfertas.filter((j) => !idsDestaque.has(j.id));
    this.offerGames = ofertasDisponiveis.slice(0, 12).map((j) => this.paraItem(j));
    this.flashDeals = ofertasDisponiveis.slice(0, 4).map((j) => this.paraItem(j));

    const candidatoSpotlight = ofertasDisponiveis[4] ?? ordem[3] ?? destaques[0];
    if (candidatoSpotlight) {
      this.destaqueEspecial = {
        ...this.paraItem(candidatoSpotlight),
        badge: 'ESCOLHA DA EQUIPE',
        image: this.bannerDe(candidatoSpotlight.id),
      };
    }

    const poolRanking = disponiveis.filter((j) => !idsDestaque.has(j.id));
    this.topRankingGames = poolRanking.slice(0, 5).map((j) => this.paraItem(j));

    const todosItens = disponiveis.map((j) => this.paraItem(j));
    this.vitrineAlta = todosItens.filter((j) => !idsDestaque.has(j.id)).slice(0, 10);
    this.vitrineDescontos = [...todosItens]
      .filter((j) => j.discountValue > 0)
      .sort((a, b) => b.discountValue - a.discountValue)
      .slice(0, 10);
    this.vitrineAcessiveis = [...todosItens]
      .filter((j) => !j.gratis && j.priceValue > 0 && j.priceValue <= 60)
      .sort((a, b) => a.priceValue - b.priceValue)
      .slice(0, 10);
    this.vitrineGratis = todosItens.filter((j) => j.gratis).slice(0, 10);

    if (this.vitrineGratis.length === 0) {
      this.vitrineGratis = [...todosItens].sort((a, b) => a.priceValue - b.priceValue).slice(0, 10);
    }

    this.montarPersonalizacao(todosItens, idsDestaque);

    if (this.activeHeroIndex >= this.heroGames.length) this.activeHeroIndex = 0;

    this.carregado = true;
    this.cdr.detectChanges();
    this.inicializarCarrosseis();

    const idsParaDetalhes = [
      ...destaques.map((j) => j.id),
      ...(candidatoSpotlight ? [candidatoSpotlight.id] : []),
    ];
    this.carregarDetalhesDestaque(idsParaDetalhes);
  }

  private atualizarDestaquesComDetalhes(): void {
    const mapaCatalogo = new Map(this.catalogo.map((j) => [j.id, j]));

    this.heroGames = this.heroGames.map((item, indice) => {
      const original = mapaCatalogo.get(item.id);
      if (!original) return item;
      return this.paraDestaque(original, indice);
    });

    if (this.destaqueEspecial) {
      const idSpot = this.destaqueEspecial.id;
      const detalhe = this.detalhesDestaque.get(idSpot);
      this.destaqueEspecial = {
        ...this.destaqueEspecial,
        subtitle: detalhe?.descricao || this.destaqueEspecial.subtitle,
        image: this.bannerDe(idSpot),
      };
    }

    this.cdr.markForCheck();
  }

  private montarPersonalizacao(todosItens: GameItem[], idsDestaque: Set<number>): void {
    const vistosIds = this.lerStorageArray<number>(STORAGE_VISTOS);
    const generosMap = this.lerStorageRecord(STORAGE_GENEROS);

    const mapaItens = new Map(todosItens.map((item) => [item.id, item]));
    this.recentlyViewedGames = vistosIds
      .map((id) => mapaItens.get(id))
      .filter((item): item is GameItem => !!item)
      .slice(0, 8);

    let generoTop = '';
    let maxScore = 0;
    for (const [gen, score] of Object.entries(generosMap)) {
      if (score > maxScore) {
        maxScore = score;
        generoTop = gen;
      }
    }

    if (generoTop) {
      const filtrados = todosItens.filter(
        (j) =>
          !idsDestaque.has(j.id) &&
          !vistosIds.slice(0, 2).includes(j.id) &&
          j.generos.some((g) => g.toLowerCase() === generoTop.toLowerCase()),
      );

      if (filtrados.length >= 3) {
        this.generoRecomendado = generoTop;
        this.recommendedGames = filtrados.slice(0, 10);
        return;
      }
    }

    this.generoRecomendado = '';
    this.recommendedGames = todosItens.filter((j) => !idsDestaque.has(j.id)).slice(4, 14);
  }

  private registrarInteracao(jogo: GameItem, peso = 1): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const atuais = this.lerStorageArray<number>(STORAGE_VISTOS).filter((id) => id !== jogo.id);
    const atualizados = [jogo.id, ...atuais].slice(0, 8);
    localStorage.setItem(STORAGE_VISTOS, JSON.stringify(atualizados));

    const generos = this.lerStorageRecord(STORAGE_GENEROS);
    for (const g of jogo.generos) {
      generos[g] = (generos[g] ?? 0) + peso;
    }
    localStorage.setItem(STORAGE_GENEROS, JSON.stringify(generos));
  }

  private lerStorageArray<T>(chave: string): T[] {
    try {
      const raw = localStorage.getItem(chave);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private lerStorageRecord(chave: string): Record<string, number> {
    try {
      const raw = localStorage.getItem(chave);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  }

  private paraItem(j: JogoCard): GameItem {
    const desc = j.preco?.desconto ?? 0;
    return {
      id: j.id,
      slug: slugDoAppid(j.id),
      title: j.nome,
      subtitle: j.generos.slice(0, 2).join(' / ') || 'PC Digital',
      generos: j.generos ?? [],
      originalPrice: j.preco?.original ?? '',
      promoPrice: j.gratis ? 'Grátis' : (j.preco?.atual ?? ''),
      discount: desc > 0 ? `-${desc}%` : '',
      discountValue: desc,
      priceValue: j.gratis ? 0 : (j.preco?.valor ?? 0),
      gratis: !!j.gratis,
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

  private carregarDetalhesDestaque(ids: number[]): void {
    for (const id of ids) {
      if (this.detalhesDestaque.has(id)) continue;
      this.detalhesDestaque.set(id, { descricao: '', screenshot: null, header: null });

      this.jogosApi
        .obterJogo(String(id))
        .pipe(take(1))
        .subscribe({
          next: (d) => {
            this.detalhesDestaque.set(id, {
              descricao: this.resumir(d.descricao ?? ''),
              screenshot: d.imagens?.[1] ?? null,
              header: d.background_image ?? null,
            });
            this.atualizarDestaquesComDetalhes();
          },
          error: () => {},
        });
    }
  }

  private resumir(texto: string, max = 135): string {
    let limpo = texto;
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(texto, 'text/html');
      limpo = doc.documentElement.textContent ?? '';
    } else {
      limpo = texto.replace(/<[^>]*>/g, ' ');
    }

    limpo = limpo.replace(/\s+/g, ' ').trim();
    if (limpo.length <= max) return limpo;
    return limpo.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  private iniciarContadorRelampago(): void {
    const atualizar = () => {
      const agora = new Date();
      const fimDoDia = new Date(agora);
      fimDoDia.setHours(23, 59, 59, 999);

      const diff = Math.max(0, fimDoDia.getTime() - agora.getTime());
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);

      this.tempoRestante = {
        horas: String(horas).padStart(2, '0'),
        minutos: String(minutos).padStart(2, '0'),
        segundos: String(segundos).padStart(2, '0'),
      };
      this.cdr.markForCheck();
    };

    atualizar();
    this.countdownTimer = setInterval(atualizar, 1000);
  }

  selecionarAba(aba: AbaVitrine): void {
    this.abaAtiva = aba;
  }

  bannerFalhou(id: number): void {
    if (this.bannerFalhou$.has(id)) return;
    this.bannerFalhou$.add(id);
    this.atualizarDestaquesComDetalhes();
  }

  imagemCardFalhou(event: Event, jogo: GameItem): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['reserva']) return;
    img.dataset['reserva'] = '1';

    this.jogosApi.obterImagemHorizontal(jogo.id).subscribe((url) => {
      if (url) img.src = url;
    });
  }

  aoClicarNoJogo(jogo: GameItem): void {
    this.registrarInteracao(jogo, 1);
  }

  irParaPaginaDoJogo(jogo: GameItem): void {
    this.registrarInteracao(jogo, 1);
    this.router.navigate(['/produto', jogo.slug]);
  }

  private adicionarAoCarrinho(jogo: GameItem): boolean {
    if (jogo.priceValue <= 0 && jogo.promoPrice !== 'Grátis') {
      this.irParaPaginaDoJogo(jogo);
      return false;
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

    return true;
  }

  comprarAgora(jogo: GameItem) {
    this.registrarInteracao(jogo, 3);
    if (this.adicionarAoCarrinho(jogo)) {
      this.router.navigate(['/carrinho']);
    }
  }

  adicionarRapido(event: Event, jogo: GameItem): void {
    event.preventDefault();
    event.stopPropagation();
    this.registrarInteracao(jogo, 2);

    if (!this.adicionarAoCarrinho(jogo)) return;

    this.adicionadoRecentemente.add(jogo.id);
    this.mostrarToast(jogo);
    this.cdr.markForCheck();

    const anterior = this.feedbackTimers.get(jogo.id);
    if (anterior) clearTimeout(anterior);

    const timer = setTimeout(() => {
      this.adicionadoRecentemente.delete(jogo.id);
      this.feedbackTimers.delete(jogo.id);
      this.cdr.markForCheck();
    }, 1500);

    this.feedbackTimers.set(jogo.id, timer);
  }

  private mostrarToast(jogo: GameItem): void {
    this.toastJogo = jogo;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastJogo = null;
      this.cdr.markForCheck();
    }, 3800);
  }

  fecharToast(): void {
    this.toastJogo = null;
  }

  selectHero(index: number) {
    if (this.swiperHero) {
      this.swiperHero.slideToLoop(index);
    }
    this.activeHeroIndex = index;
    this.cdr.markForCheck();
  }
}
