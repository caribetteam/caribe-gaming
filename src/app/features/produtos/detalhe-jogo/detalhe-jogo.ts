import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, Location, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { JogosApiService } from '../../../core/services/jogos-api.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { DetalhesJogo, Comentario, JogoCard, Dlc } from '../../../core/models/jogo';
import { LoaderBarco } from '../carregamento/cacrregamento-barco';
import { comentariosDoJogo } from '../comentarios';
import { appidDoSlug, slugDoAppid } from '../../../core/utils/slug';

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderBarco],
  templateUrl: './detalhe-jogo.html',
  styleUrls: ['./detalhe-jogo.css']
})
export class DetalheJogo implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private jogosApi = inject(JogosApiService);
  private carrinhoFacade = inject(CarrinhoFacade);
  private favoritosService = inject(FavoritosService);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);

  jogo: DetalhesJogo | null = null;
  carregando: boolean = true;
  erro: boolean = false;
  emEstoque: boolean = true;
  jogoIdOuSlug: string = '';
  galeriaImagens: string[] = [];
  indiceAtivo: number = 0;
  favorito: boolean = false;
  mensagemToast: string | null = null;
  precoOriginalFormatado: string = '';
  precoFormatado: string = '';
  precoNumero: number = 0;
  desconto: number = 0;
  genero: string = '';

  // Capa vertical (primeiro slide da galeria). Fica null se a imagem não existir.
  capaGaleria: string | null = null;

  // Nota da Steam
  notaSteam: string = '—';
  notaSteamNum: number = 0;
  totalSteam: number = 0;
  requisitosMinimos: string = '';
  requisitosRecomendados: string = '';

  // Seções extras
  recomendados: JogoCard[] = [];
  dlcs: Dlc[] = [];

  // Avaliações do site
  exibirModalAvaliacao: boolean = false;
  tentouEnviar: boolean = false;
  readonly notasModal = [1, 2, 3, 4, 5];
  novoNome: string = '';
  novoTexto: string = '';
  novaNota: number = 5;
  listaComentarios: Comentario[] = [];
  totalSite: number = 0;
  mediaSite: string = '—';
  mediaSiteNum: number = 0;
  distribuicao: { estrelas: number; qtd: number; pct: number }[] = [];
  // Voto de cada comentário neste navegador: { idDoComentario: 'like' | 'dislike' }
  votos: Record<number, 'like' | 'dislike'> = {};
  readonly coresAvatares = ['#00d2d3', '#ff9f43', '#ee5253', '#0abde3', '#10ac84', '#5f27cd'];

  // O slide atual é a capa vertical? (usa fundo desfocado e mostra a imagem inteira)
  get capaAtiva(): boolean {
    return !!this.capaGaleria && this.indiceAtivo === 0 && this.galeriaImagens[0] === this.capaGaleria;
  }

  ngOnInit(): void {
    // No servidor (SSR) não busca nada: a tela sai com o barquinho de carregamento
    // e o navegador carrega os dados logo depois.
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.paramMap.subscribe((params) => {
      const parametro = params.get('slug') ?? params.get('id') ?? '';
      const appid = appidDoSlug(parametro);

      // endereço que não existe: vai para a página 404 (sem deixar o endereço errado no histórico)
      if (appid === null) {
        this.router.navigate(['/404'], { replaceUrl: true });
        return;
      }

      // link antigo com número (/produto/292030): troca pelo nome do jogo e espera a nova rota
      if (/^\d+$/.test(parametro.trim())) {
        this.router.navigate(['/produto', slugDoAppid(appid)], { replaceUrl: true });
        return;
      }

      // por dentro, o resto do componente continua trabalhando com o appid
      this.jogoIdOuSlug = String(appid);
      this.resetarEstado();
      this.carregarTudo();
    });
  }

  ngOnDestroy(): void {
    this.travarRolagem(false);
  }

  private resetarEstado(): void {
    this.carregando = true;
    this.erro = false;
    this.jogo = null;
    this.galeriaImagens = [];
    this.capaGaleria = null;
    this.indiceAtivo = 0;
    this.precoOriginalFormatado = '';
    this.precoFormatado = '';
    this.precoNumero = 0;
    this.desconto = 0;
    this.notaSteam = '—';
    this.notaSteamNum = 0;
    this.totalSteam = 0;
    this.requisitosMinimos = '';
    this.requisitosRecomendados = '';
    this.recomendados = [];
    this.dlcs = [];
    this.listaComentarios = [];
    this.recalcularResumo();
  }

  private carregarTudo(): void {
    this.favorito = this.favoritosService.ehFavorito(this.jogoIdOuSlug);
    this.jogosApi.obterJogo(this.jogoIdOuSlug).subscribe({
      next: (d) => {
        this.jogo = d;

        // A capa vem na posição 0 da galeria
        this.galeriaImagens = d.imagens ?? [];
        this.capaGaleria = d.capa ?? null;
        this.indiceAtivo = 0;

        this.genero = d.generos ?? '';
        this.emEstoque = d.estoque ?? true;
        this.desconto = d.preco?.desconto ?? 0;
        this.precoFormatado = d.gratis ? 'Grátis' : (d.preco?.atual ?? 'Indisponível');
        this.precoOriginalFormatado = d.preco?.original ?? '';
        this.precoNumero = d.gratis ? 0 : (d.preco?.valor ?? 0);
        this.notaSteam = d.avaliacao?.nota ?? '—';
        this.notaSteamNum = d.avaliacao ? Number(d.avaliacao.nota) : 0;
        this.totalSteam = d.avaliacao?.total ?? 0;
        this.requisitosMinimos = d.requisitos?.minimos ?? '';
        this.requisitosRecomendados = d.requisitos?.recomendados ?? '';
        this.carregando = false;
        this.carregarAvaliacoes();
        this.carregarRecomendados(d);
        this.carregarDlcs(d);
        this.cdr.markForCheck();
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private carregarRecomendados(d: DetalhesJogo): void {
    const idAtual = Number(d.id);
    this.jogosApi.listar().pipe(take(1)).subscribe((lista) => {
      const atual = lista.find((j) => j.id === idAtual);
      const cats = new Set(atual?.categorias ?? []);
      const gens = new Set(atual?.generos ?? []);
      this.recomendados = lista
        .filter((j) => j.id !== idAtual)
        .map((j) => ({
          j,
          pontos:
            j.categorias.filter((c) => cats.has(c)).length * 2 +
            j.generos.filter((g) => gens.has(g)).length
        }))
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 6)
        .map((x) => x.j);
      this.cdr.markForCheck();
    });
  }

  private carregarDlcs(d: DetalhesJogo): void {
    if (!d.dlcIds?.length) return;
    this.jogosApi.obterDlcs(Number(d.id), d.dlcIds).subscribe((lista) => {
      if (this.jogoIdOuSlug !== String(d.id)) return;
      this.dlcs = lista;
      this.cdr.markForCheck();
    });
  }

  abrirJogo(id: number): void {
    this.router.navigate(['/produto', slugDoAppid(id)]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  adicionarDlcAoCarrinho(dlc: Dlc): void {
    if (!dlc.preco) return;
    this.carrinhoFacade.adicionarProduto({
      id: dlc.id,
      nome: dlc.nome,
      preco: dlc.preco.valor,
      quantidade: 1,
      imagemUrl: dlc.imagem,
      plataforma: this.jogo?.plataformas || 'PC',
      categoria: 'DLC / Expansão'
    });
    this.exibirToast('🔑 Expansão adicionada ao carrinho!');
  }

  rastrearRec(_i: number, j: JogoCard): number { return j.id; }
  rastrearBarra(_i: number, b: { estrelas: number }): number { return b.estrelas; }

  tratarErroImagem(event: Event): void {
    const imgElem = event.target as HTMLImageElement;

    // A capa principal falhou: tenta a capa certa pela API da Steam; se não houver, tira da galeria
    if (this.capaGaleria && imgElem.getAttribute('src') === this.capaGaleria) {
      const falhou = this.capaGaleria;

      this.jogosApi.obterCapaAlternativa(Number(this.jogo?.id)).subscribe((url) => {
        const i = this.galeriaImagens.indexOf(falhou);
        if (i < 0) return;

        if (url && url !== falhou) {
          this.galeriaImagens[i] = url; // troca a capa quebrada pela correta
          this.capaGaleria = url;
        } else {
          this.galeriaImagens = this.galeriaImagens.filter((u) => u !== falhou);
          this.capaGaleria = null;
          this.indiceAtivo = 0;
        }
        this.cdr.markForCheck();
      });
      return;
    }

    // Outras imagens: tenta a imagem principal do jogo
    if (this.jogo?.background_image && imgElem.src !== this.jogo.background_image) {
      imgElem.src = this.jogo.background_image;
    }
  }

  private nivelClassificacao(valor?: string): string {
    if (!valor) return 'L';
    const v = valor.toLowerCase().trim();
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) {
      if (n >= 18) return '18';
      if (n >= 16) return '16';
      if (n >= 14) return '14';
      if (n >= 12) return '12';
      if (n >= 10) return '10';
      return 'L';
    }
    if (v.includes('mature') || v.includes('adults')) return '18';
    if (v.includes('teen')) return '14';
    return 'L';
  }

  formatarClassificacao(classificacao?: string): string {
    return this.nivelClassificacao(classificacao);
  }

  obterClasseClassificacao(classificacao?: string): string {
    switch (this.nivelClassificacao(classificacao)) {
      case '18': return 'dezoito';
      case '16': return 'dezesseis';
      case '14': return 'quatorze';
      case '12': return 'doze';
      case '10': return 'dez';
      default: return 'livre';
    }
  }

  formatarMilhar(n: number): string {
    return n.toLocaleString('pt-BR');
  }

  resumoLista(texto: string | undefined, max = 1): string {
    const itens = (texto ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (itens.length <= max) return itens.join(', ');
    return `${itens.slice(0, max).join(', ')} +${itens.length - max}`;
  }

  getEstrelasTexto(n: number): string {
    const r = Math.max(0, Math.min(5, Math.round(n)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  private get chaveAvaliacoes(): string { return `caribe_avaliacoes_v2_${this.jogoIdOuSlug}`; }
  private get chaveVotos(): string { return `caribe_votos_v1_${this.jogoIdOuSlug}`; }

  private comentariosPadrao(): Comentario[] {
    if (!this.jogo) return [];
    const primeiroGenero = (this.jogo.generos ?? '').split(',')[0]?.trim() ?? '';
    return comentariosDoJogo(Number(this.jogo.id), this.jogo.nome, primeiroGenero);
  }

  carregarAvaliacoes(): void {
    try {
      const salvas = localStorage.getItem(this.chaveAvaliacoes);
      this.listaComentarios = salvas ? JSON.parse(salvas) : this.comentariosPadrao();
    } catch {
      this.listaComentarios = this.comentariosPadrao();
    }
    this.carregarVotos();
    this.recalcularResumo();
  }

  private carregarVotos(): void {
    try {
      const salvos = localStorage.getItem(this.chaveVotos);
      this.votos = salvos ? JSON.parse(salvos) : {};
    } catch {
      this.votos = {};
    }
  }

  private salvarVotos(): void {
    try {
      localStorage.setItem(this.chaveVotos, JSON.stringify(this.votos));
    } catch {}
  }

  salvarAvaliacoes(): void {
    try {
      localStorage.setItem(this.chaveAvaliacoes, JSON.stringify(this.listaComentarios));
    } catch {}
  }

  private recalcularResumo(): void {
    const total = this.listaComentarios.length;
    const soma = this.listaComentarios.reduce((acc, c) => acc + c.estrelas, 0);
    this.totalSite = total;
    this.mediaSiteNum = total ? soma / total : 0;
    this.mediaSite = total ? this.mediaSiteNum.toFixed(1) : '—';
    this.distribuicao = [5, 4, 3, 2, 1].map((estrelas) => {
      const qtd = this.listaComentarios.filter((c) => c.estrelas === estrelas).length;
      return { estrelas, qtd, pct: total ? (qtd / total) * 100 : 0 };
    });
  }

  get nomeInvalido(): boolean { return this.novoNome.trim().length < 2; }
  get textoInvalido(): boolean { return this.novoTexto.trim().length < 10; }

  enviarAvaliacao(): void {
    this.tentouEnviar = true;
    if (this.nomeInvalido || this.textoInvalido) return;
    const nova: Comentario = {
      id: Date.now(),
      autor: this.novoNome.trim(),
      avatar: this.novoNome.trim().charAt(0).toUpperCase(),
      corAvatar: this.coresAvatares[Math.floor(Math.random() * this.coresAvatares.length)],
      estrelas: Number(this.novaNota),
      texto: this.novoTexto.trim(),
      data: new Date().toLocaleDateString('pt-BR'),
      likes: 0,
      dislikes: 0
    };
    this.listaComentarios.unshift(nova);
    this.salvarAvaliacoes();
    this.recalcularResumo();
    this.fecharModal();
    this.exibirToast('⭐ Sua avaliação foi publicada com sucesso!');
  }

  voltarPagina(): void { this.location.back(); }
  irParaHome(): void { this.router.navigate(['/']); }
  irParaJogos(): void { this.router.navigate(['/jogos']); }

  proximaFoto(): void {
    if (!this.galeriaImagens.length) return;
    this.indiceAtivo = (this.indiceAtivo + 1) % this.galeriaImagens.length;
  }

  fotoAnterior(): void {
    if (!this.galeriaImagens.length) return;
    this.indiceAtivo = (this.indiceAtivo - 1 + this.galeriaImagens.length) % this.galeriaImagens.length;
  }

  selecionarIndice(i: number): void { this.indiceAtivo = i; }

  adicionarAoCarrinho(): void {
    if (!this.jogo || !this.emEstoque) return;
    this.carrinhoFacade.adicionarProduto({
      id: Number(this.jogo.id) || Date.now(),
      nome: this.jogo.nome,
      preco: this.precoNumero,
      quantidade: 1,
      imagemUrl: this.galeriaImagens[0] || this.jogo.background_image || '',
      plataforma: this.jogo.plataformas || 'PC',
      categoria: this.genero
    });
    this.exibirToast('Adicionado ao carrinho!');
  }

  comprarAgora(): void {
    if (!this.emEstoque) return;
    this.adicionarAoCarrinho();
    this.router.navigate(['/carrinho']);
  }

  // Salva de verdade no FavoritosService, então aparece na aba Favoritos da listagem
  toggleFavorito(): void {
    if (!this.jogo) return;
    const id = String(this.jogo.id);

    this.favoritosService.toggleFavorito({
      id,
      nome: this.jogo.nome,
      genero: this.genero,
      plataforma: this.jogo.plataformas,
      precoOriginal: this.precoOriginalFormatado,
      precoPromocional: this.precoFormatado,
      desconto: this.desconto,
      categorias: [],
      imagem: this.galeriaImagens[0] ?? this.jogo.background_image,
      slug: slugDoAppid(id)
    });

    this.favorito = this.favoritosService.ehFavorito(id);
    this.exibirToast(this.favorito ? '❤️ Salvo nos favoritos!' : '💔 Removido dos favoritos!');
  }

  abrirModal(): void {
    this.tentouEnviar = false;
    this.novaNota = 5;
    this.exibirModalAvaliacao = true;
    this.travarRolagem(true);
  }

  fecharModal(): void {
    this.exibirModalAvaliacao = false;
    this.tentouEnviar = false;
    this.novoNome = '';
    this.novoTexto = '';
    this.travarRolagem(false);
  }

  // clicar no fundo escuro (e não dentro do cartão) fecha o modal
  cliqueNoFundo(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.fecharModal();
  }

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    if (this.exibirModalAvaliacao) this.fecharModal();
  }

  // com o modal aberto, a página de trás não rola
  private travarRolagem(travar: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc.body.style.overflow = travar ? 'hidden' : '';
  }

  // Um voto por pessoa em cada comentário:
  //  - clicar em 👍 marca; clicar de novo desmarca
  //  - se já tinha 👎, clicar em 👍 troca o voto (os dois nunca ficam marcados juntos)
  votar(c: Comentario, tipo: 'like' | 'dislike'): void {
    const atual = this.votos[c.id];

    if (atual === tipo) {
      // desfaz o voto
      if (tipo === 'like') c.likes = Math.max(0, c.likes - 1);
      else c.dislikes = Math.max(0, c.dislikes - 1);
      delete this.votos[c.id];
    } else {
      // tira o voto anterior (se houver) e coloca o novo
      if (atual === 'like') c.likes = Math.max(0, c.likes - 1);
      if (atual === 'dislike') c.dislikes = Math.max(0, c.dislikes - 1);
      if (tipo === 'like') c.likes++;
      else c.dislikes++;
      this.votos[c.id] = tipo;
    }

    this.salvarVotos();
    this.salvarAvaliacoes();
    this.cdr.markForCheck();
  }

  private exibirToast(msg: string): void {
    this.mensagemToast = msg;
    this.cdr.markForCheck();
    setTimeout(() => { this.mensagemToast = null; this.cdr.markForCheck(); }, 3000);
  }
}