import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CATALOGO, JogoCard, Produto } from '../models/jogo';
import { JogosApiService } from './jogos-api.service';

// "acao" encontra "Ação", "sobrevivencia" encontra "Sobrevivência"...
const semAcento = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private jogosApi = inject(JogosApiService);

  obterProdutos(opts: { q?: string; plataforma?: 'pc' | 'ps'; pagina?: number } = {}): Observable<Produto[]> {
    return this.jogosApi
      .listar(opts)
      .pipe(map((lista) => lista.map((j) => this.mapearJogoParaProduto(j))));
  }

  // Busca instantânea direto no catálogo (sem chamar a Steam). Usada na pesquisa do menu.
  buscarNoCatalogo(termo: string, limite = 6): Produto[] {
    const t = semAcento(termo.trim());
    if (!t) return [];

    return CATALOGO.filter(
      (g) => semAcento(g.nome).includes(t) || g.generos.some((x) => semAcento(x).includes(t))
    )
      .slice(0, limite)
      .map((g) => ({
        id: String(g.appid),
        nome: g.nome,
        genero: g.generos.join(' / '),
        plataforma: g.plataformas.join(' / '),
        precoOriginal: '',
        precoPromocional: '',
        desconto: 0,
        categorias: g.categorias,
        slug: String(g.appid),
      }));
  }

  // Capa de reserva, usada só quando a capa principal do card não carrega
  obterCapaAlternativa(id: string): Observable<string | null> {
    return this.jogosApi.obterCapaAlternativa(Number(id));
  }

  private mapearJogoParaProduto(j: JogoCard): Produto {
    return {
      id: j.id.toString(),
      nome: j.nome,
      imagem: j.capa || 'assets/imagens/placeholder.jpg',
      imagemPosicao: 'center',
      precoOriginal: j.preco?.original ?? '',
      precoPromocional: j.gratis ? 'Grátis' : (j.preco?.atual ?? 'Indisponível'),
      precoNumero: j.gratis ? 0 : (j.preco?.valor ?? 0),
      desconto: j.preco?.desconto ?? 0,
      genero: j.generos.join(' / ') || 'Ação',
      plataforma: j.plataformas.join(' / ') || 'PC',
      categorias: j.categorias,
      slug: j.slug,
      estoque: j.estoque,
    };
  }
}