import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutosService, semAcento } from '../../core/services/produtos.service';
import { slugDoAppid } from '../../core/utils/slug';
import { LoaderBarco } from './carregamento/cacrregamento-barco';

// Capas que a Steam gera sozinha (arte pequena em cima e degradê embaixo) quase não têm detalhe
// na parte de baixo. Se a média ficar abaixo deste valor, a capa é trocada pela horizontal.
const LIMITE_CAPA_LISA = 2.5;

// Se alguma capa boa for trocada sem querer, coloque o appid aqui. Para forçar a troca, use o outro.
const SEMPRE_CAPA_VERTICAL = new Set<number>([]);
const SEMPRE_CAPA_HORIZONTAL = new Set<number>([]);

// Média das diferenças entre pixels vizinhos nos 40% de baixo da capa (0 = totalmente liso)
function detalheInferior(dados: Uint8ClampedArray, w: number, h: number): number {
  const lum = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return 0.299 * dados[i] + 0.587 * dados[i + 1] + 0.114 * dados[i + 2];
  };
  let soma = 0;
  let qtd = 0;
  for (let y = Math.floor(h * 0.6); y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      soma += Math.abs(lum(x, y) - lum(x + 1, y)) + Math.abs(lum(x, y) - lum(x, y + 1));
      qtd += 2;
    }
  }
  return qtd ? soma / qtd : 99;
}
import { CarrinhoFacade } from '../../core/facades/carrinho.facade';
import { FavoritosService } from '../../core/services/favoritos.service';
import { Produto } from '../../core/models/jogo';
import { PlataformaIcones } from '../../shared/console/console-icones';

export interface CategoriaItem {
  id: string;
  nome: string;
  icone: string;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, PlataformaIcones, LoaderBarco],
  templateUrl: './produtos.html',
  styleUrls: ['./produtos.css'],
})
export class Produtos implements OnInit {
  private produtosService = inject(ProdutosService);
  private carrinhoFacade = inject(CarrinhoFacade);
  private favoritosService = inject(FavoritosService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  produtos: Produto[] = [];
  produtosExibidos: Produto[] = [];

  // Estados de Abas e Filtros
  abaAtiva: 'todos' | 'favoritos' = 'todos';
  faixaPrecoAtiva: string = 'todos';
  plataformasSelecionadas: string[] = [];
  apenasPromocao: boolean = false;
  ordenacao: string = 'relevancia';

  // Dropdown e Categoria
  menuCategoriasAberto: boolean = false;
  categoriaAtiva: string | null = null;
  mensagemToast: string | null = null;

  // Filtros recolhíveis (mobile)
  filtrosAbertos: boolean = false;

  // Carregamento e erro da lista
  carregando: boolean = true;
  erro: boolean = false;
  private assinatura?: Subscription;
  private timerTimeout: any;

  // Texto vindo da pesquisa do menu (/jogos?busca=...)
  termoBusca: string = '';

  readonly faixasPreco = [
    { id: 'todos', nome: 'Todos' },
    { id: 'gratis', nome: 'Grátis' },
    { id: '0-50', nome: 'Até R$50' },
    { id: '50-100', nome: 'R$50 – R$100' },
    { id: 'acima-100', nome: 'Acima de R$100' },
  ];

  // "id" precisa ser igual ao usado em CATALOGO.plataformas
  readonly plataformasFiltro = [
    { id: 'PC', nome: 'PC', icone: 'fa-brands fa-windows' },
    { id: 'PS', nome: 'PlayStation', icone: 'fa-brands fa-playstation' },
    { id: 'Xbox', nome: 'Xbox', icone: 'fa-brands fa-xbox' },
    { id: 'Switch', nome: 'Switch', icone: 'fa-brands fa-nintendo-switch' },
  ];

  readonly opcoesOrdenacao = [
    { id: 'relevancia', nome: 'Relevância' },
    { id: 'menor-preco', nome: 'Menor preço' },
    { id: 'maior-preco', nome: 'Maior preço' },
    { id: 'maior-desconto', nome: 'Maior desconto' },
    { id: 'az', nome: 'A – Z' },
  ];

  // "id" precisa ser igual aos slugs de CATALOGO.categorias
  readonly categorias: CategoriaItem[] = [
    { id: 'action', nome: 'Ação', icone: '⚔️' },
    { id: 'role-playing-rpg', nome: 'RPG', icone: '🛡️' },
    { id: 'adventure', nome: 'Aventura', icone: '🧭' },
    { id: 'shooter', nome: 'FPS / Tiro', icone: '🎯' },
    { id: 'simulation', nome: 'Simulação', icone: '🚗' },
    { id: 'strategy', nome: 'Estratégia', icone: '♟️' },
    { id: 'platform', nome: 'Plataforma', icone: '🪂' },
    { id: 'sport', nome: 'Esportes', icone: '⚽' },
    { id: 'racing', nome: 'Corrida', icone: '🏁' },
    { id: 'indie', nome: 'Indie', icone: '🎨' },
  ];

  ngOnInit(): void {
    // Toda vez que a pesquisa do menu muda, o catálogo é filtrado de novo
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.termoBusca = (params.get('busca') ?? '').trim();
      this.aplicarFiltros();
    });

    this.carregarProdutos();
  }

  // A lista chega de novo a cada 5 min (preços atualizados na Steam).
  // Os filtros ficam guardados aqui no componente, então são reaplicados a cada chegada.
  carregarProdutos(): void {
    this.assinatura?.unsubscribe();
    this.carregando = this.produtos.length === 0; // com a lista já na tela, não esconde nada
    this.erro = false;
    this.iniciarTempoLimite();

    this.assinatura = this.produtosService
      .obterProdutos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dados) => {
          this.limparTempoLimite();
          this.carregando = false;

          // A Steam respondeu vazio e não há lista anterior: trata como erro
          if (dados.length === 0 && this.produtos.length === 0) {
            this.erro = true;
            this.cdr.markForCheck();
            return;
          }

          this.erro = false;
          this.produtos = dados;
          this.aplicarFiltros();
        },
        error: (err) => {
          console.error('Erro ao carregar lista de jogos:', err);
          this.limparTempoLimite();
          this.carregando = false;
          // se já havia uma lista, continua mostrando ela; senão mostra a tela de erro
          if (this.produtos.length === 0) this.erro = true;
          this.cdr.markForCheck();
        },
      });
  }

  tentarNovamente(): void {
    this.carregarProdutos();
  }

  // se a Steam demorar demais, mostra o erro em vez de deixar o barquinho navegando para sempre
  private iniciarTempoLimite(): void {
    this.limparTempoLimite();
    if (!isPlatformBrowser(this.platformId)) return;
    this.timerTimeout = setTimeout(() => {
      if (this.carregando) {
        this.carregando = false;
        this.erro = true;
        this.cdr.markForCheck();
      }
    }, 25000);
  }

  private limparTempoLimite(): void {
    clearTimeout(this.timerTimeout);
  }

  get quantidadeFavoritos(): number {
    return this.favoritosService.obterFavoritos().length;
  }

  get filtrosAtivos(): number {
    return (
      (this.faixaPrecoAtiva !== 'todos' ? 1 : 0) +
      this.plataformasSelecionadas.length +
      (this.apenasPromocao ? 1 : 0) +
      (this.categoriaAtiva ? 1 : 0)
    );
  }

  // --- LÓGICA DE FILTRAGEM ---
  aplicarFiltros(): void {
    let resultado = this.produtos.map((p) => ({
      ...p,
      favorito: this.favoritosService.ehFavorito(p.id),
    }));

    // 1. Aba de Favoritos
    if (this.abaAtiva === 'favoritos') {
      resultado = resultado.filter((p) => p.favorito);
    }

    // 1.1 Texto da pesquisa do menu (sem diferenciar acento nem maiúscula)
    if (this.termoBusca) {
      const t = semAcento(this.termoBusca);
      resultado = resultado.filter(
        (p) => semAcento(p.nome).includes(t) || semAcento(p.genero).includes(t),
      );
    }

    // 2. Categoria
    if (this.categoriaAtiva) {
      const cat = this.categoriaAtiva;
      resultado = resultado.filter((p) => p.categorias?.includes(cat));
    }

    // 3. Só em promoção
    if (this.apenasPromocao) {
      resultado = resultado.filter((p) => this.temDesconto(p.desconto));
    }

    // 4. Faixa de preço
    switch (this.faixaPrecoAtiva) {
      case 'gratis':
        resultado = resultado.filter((p) => this.ehGratis(p));
        break;
      case '0-50':
        resultado = resultado.filter((p) => this.temPreco(p) && this.valorPreco(p) <= 50);
        break;
      case '50-100':
        resultado = resultado.filter(
          (p) => this.temPreco(p) && this.valorPreco(p) > 50 && this.valorPreco(p) <= 100,
        );
        break;
      case 'acima-100':
        resultado = resultado.filter((p) => this.temPreco(p) && this.valorPreco(p) > 100);
        break;
    }

    // 5. Plataforma (basta ter uma das selecionadas)
    if (this.plataformasSelecionadas.length > 0) {
      resultado = resultado.filter((p) => {
        const lista = p.plataforma.split('/').map((x) => x.trim());
        return this.plataformasSelecionadas.some((sel) => lista.includes(sel));
      });
    }

    // 6. Ordenação
    switch (this.ordenacao) {
      case 'menor-preco':
        resultado.sort((a, b) => this.valorParaOrdenar(a, true) - this.valorParaOrdenar(b, true));
        break;
      case 'maior-preco':
        resultado.sort((a, b) => this.valorParaOrdenar(b, false) - this.valorParaOrdenar(a, false));
        break;
      case 'maior-desconto':
        resultado.sort((a, b) => this.descontoNumero(b.desconto) - this.descontoNumero(a.desconto));
        break;
      case 'az':
        resultado.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        break;
      default:
        // relevância: com pesquisa, quem começa com o termo vem primeiro
        if (this.termoBusca) {
          const t = semAcento(this.termoBusca);
          const pontos = (p: Produto) => {
            const n = semAcento(p.nome);
            return n.startsWith(t) ? 0 : n.includes(' ' + t) ? 1 : n.includes(t) ? 2 : 3;
          };
          resultado.sort((a, b) => pontos(a) - pontos(b));
        }
    }

    this.produtosExibidos = resultado;
    this.cdr.markForCheck();
  }

  // --- MÉTODOS DISPARADOS PELO HTML ---
  definirFaixaPreco(faixa: string): void {
    this.faixaPrecoAtiva = faixa;
    this.aplicarFiltros();
  }

  togglePlataforma(plataforma: string): void {
    const idx = this.plataformasSelecionadas.indexOf(plataforma);
    if (idx >= 0) {
      this.plataformasSelecionadas.splice(idx, 1);
    } else {
      this.plataformasSelecionadas.push(plataforma);
    }
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.faixaPrecoAtiva = 'todos';
    this.plataformasSelecionadas = [];
    this.apenasPromocao = false;
    this.categoriaAtiva = null;
    this.aplicarFiltros();
  }

  // tira o texto da pesquisa (e o ?busca= do endereço)
  limparBusca(): void {
    this.router.navigate(['/jogos'], { queryParams: { busca: null }, queryParamsHandling: 'merge' });
  }

  limparTudo(): void {
    this.limparFiltros();
    if (this.termoBusca) this.limparBusca();
  }

  toggleFiltros(): void {
    this.filtrosAbertos = !this.filtrosAbertos;
  }

  selecionarAba(aba: 'todos' | 'favoritos'): void {
    this.abaAtiva = aba;
    this.aplicarFiltros();
  }

  toggleMenuCategorias(): void {
    this.menuCategoriasAberto = !this.menuCategoriasAberto;
  }

  selecionarCategoria(catId: string): void {
    this.categoriaAtiva = catId ? catId : null;
    this.menuCategoriasAberto = false;
    this.aplicarFiltros();
  }

  obterNomeCategoriaAtiva(): string {
    if (!this.categoriaAtiva) return '🏝️ Categorias';
    const cat = this.categorias.find((c) => c.id === this.categoriaAtiva);
    return cat ? `${cat.icone} ${cat.nome}` : '🏝️ Categorias';
  }

  rastrear(_indice: number, produto: Produto): string {
    return produto.id;
  }

  // Roda quando a capa carregou. Se for uma capa automática da Steam, troca pela horizontal inteira.
  imagemCarregou(event: Event, produto: Produto): void {
    const img = event.target as HTMLImageElement;
    if (!isPlatformBrowser(this.platformId) || img.dataset['verificada']) return;
    img.dataset['verificada'] = '1';

    const appid = Number(produto.id);
    if (SEMPRE_CAPA_VERTICAL.has(appid)) return;

    if (SEMPRE_CAPA_HORIZONTAL.has(appid)) {
      this.trocarPorHorizontal(img, produto);
      return;
    }

    // outra cópia da imagem, em modo que permite ler os pixels
    const sonda = new Image();
    sonda.crossOrigin = 'anonymous';
    sonda.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 60;
        const c = canvas.getContext('2d', { willReadFrequently: true });
        if (!c) return;
        c.drawImage(sonda, 0, 0, 40, 60);
        const dados = c.getImageData(0, 0, 40, 60).data;
        if (detalheInferior(dados, 40, 60) < LIMITE_CAPA_LISA) this.trocarPorHorizontal(img, produto);
      } catch {
        /* sem permissão para ler os pixels: mantém a capa como está */
      }
    };
    sonda.onerror = () => {}; // o servidor não deixou ler: mantém a capa como está
    sonda.src = img.currentSrc || img.src;
  }

  private trocarPorHorizontal(img: HTMLImageElement, produto: Produto): void {
    const caixa = img.parentElement as HTMLElement | null;
    const url = `https://cdn.cloudflare.steamstatic.com/steam/apps/${produto.id}/header.jpg`;
    img.dataset['reserva'] = '1'; // se esta também falhar, mostra o cartão com o nome
    caixa?.style.setProperty('--capa', `url("${url}")`);
    caixa?.classList.add('capa-reserva');
    img.classList.add('capa-horizontal');
    img.src = url;
  }

  // Só roda quando a capa principal do card falhou (cdn.cloudflare ou a manual).
  // 1ª falha: busca a capa certa na API da Steam (vertical) ou a imagem horizontal, que aparece
  //           inteira sobre um fundo desfocado dela mesma.
  // 2ª falha (ou nada encontrado): mostra um cartão com o nome do jogo.
  imagemFalhou(event: Event, produto: Produto): void {
    const img = event.target as HTMLImageElement;
    const caixa = img.parentElement as HTMLElement | null;

    if (img.dataset['reserva']) {
      this.mostrarSemImagem(img, caixa, produto);
      return;
    }
    img.dataset['reserva'] = '1';

    this.produtosService.obterCapaAlternativa(produto.id).subscribe((url) => {
      if (!url) {
        this.mostrarSemImagem(img, caixa, produto);
        return;
      }
      caixa?.style.setProperty('--capa', `url("${url}")`);
      caixa?.classList.add('capa-reserva');
      img.classList.add('capa-horizontal');
      img.src = url;
    });
  }

  private mostrarSemImagem(img: HTMLImageElement, caixa: HTMLElement | null, produto: Produto): void {
    img.style.visibility = 'hidden';
    caixa?.classList.remove('capa-reserva');
    caixa?.classList.add('sem-imagem');
    caixa?.setAttribute('data-nome', produto.nome);
  }

  // --- NAVEGAÇÃO E AÇÕES DE E-COMMERCE ---
  irParaPaginaDoJogo(produto: Produto): void {
    this.router.navigate(['/produto', slugDoAppid(produto.id)]);
  }

  adicionarAoCarrinho(produto: Produto): void {
    if (produto.estoque === false) {
      this.exibirToast('😕 Jogo esgotado no momento');
      return;
    }
    if (this.estaIndisponivel(produto)) {
      this.exibirToast('😕 Preço indisponível no momento');
      return;
    }

    this.carrinhoFacade.adicionarProduto({
      id: Number(produto.id) || Date.now(),
      nome: produto.nome,
      preco: this.valorPreco(produto),
      quantidade: 1,
      imagemUrl: produto.imagem || '',
      plataforma: produto.plataforma,
      categoria: produto.genero,
    });
    this.exibirToast('🛒 Adicionado ao carrinho com sucesso!');
  }

  toggleFavorito(produto: Produto): void {
    this.favoritosService.toggleFavorito(produto);
    produto.favorito = !produto.favorito;

    this.exibirToast(produto.favorito ? '❤️ Salvo nos favoritos!' : '💔 Removido dos favoritos!');

    this.aplicarFiltros();
  }

  limparFavoritos(): void {
    this.favoritosService.limparTodosFavoritos();
    this.produtos.forEach((p) => (p.favorito = false));
    this.aplicarFiltros();
    this.exibirToast('🗑️ Favoritos limpos com sucesso!');
  }

  // --- AUXILIARES DE PREÇO ---
  descontoNumero(desconto: number | string | undefined): number {
    if (!desconto) return 0;
    if (typeof desconto === 'number') return desconto;
    return parseFloat(desconto.replace(/[^0-9.]/g, '')) || 0;
  }

  temDesconto(desconto: number | string | undefined): boolean {
    return this.descontoNumero(desconto) > 0;
  }

  textoDesconto(desconto: number | string | undefined): string {
    return `-${this.descontoNumero(desconto)}%`;
  }

  ehGratis(p: Produto): boolean {
    return p.precoPromocional === 'Grátis';
  }

  estaIndisponivel(p: Produto): boolean {
    return p.precoPromocional === 'Indisponível';
  }

  // tem um preço real maior que zero
  private temPreco(p: Produto): boolean {
    return !this.ehGratis(p) && !this.estaIndisponivel(p) && this.valorPreco(p) > 0;
  }

  private valorPreco(p: Produto): number {
    return p.precoNumero ?? this.extrairValorPreco(p.precoPromocional);
  }

  // jogos sem preço vão sempre para o fim da lista
  private valorParaOrdenar(p: Produto, crescente: boolean): number {
    if (this.estaIndisponivel(p)) return crescente ? Number.MAX_SAFE_INTEGER : -1;
    return this.valorPreco(p);
  }

  private extrairValorPreco(precoStr: string): number {
    if (!precoStr) return 0;
    const limpo = precoStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(limpo) || 0;
  }

  private exibirToast(msg: string): void {
    this.mensagemToast = msg;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.mensagemToast = null;
      this.cdr.markForCheck();
    }, 3000);
  }
}