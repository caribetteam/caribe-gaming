// src/app/core/services/produtos.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CATALOGO, JogoCard, Produto } from '../models/jogo';
import { JogosApiService } from './jogos-api.service';
import { slugDoAppid } from '../utils/slug';

// "acao" encontra "Ação", "sobrevivencia" encontra "Sobrevivência"...
export const semAcento = (t: string) =>
  (t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export interface ResultadoBusca {
  itens: Produto[]; // os primeiros resultados (para o menu da pesquisa)
  total: number; // quantos jogos combinam no total
}

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private jogosApi = inject(JogosApiService);

  obterProdutos(opts: { q?: string; plataforma?: 'pc' | 'ps'; pagina?: number } = {}): Observable<Produto[]> {
    return this.jogosApi
      .listar(opts)
      .pipe(map((lista) => lista.map((j) => this.mapearJogoParaProduto(j))));
  }

  // Busca instantânea direto no catálogo (sem chamar a Steam). Usada na pesquisa do menu.
  // Ordem: começa com o termo > palavra começa com o termo > contém no nome > só no gênero
  buscarCatalogo(termo: string, limite = 6): ResultadoBusca {
    const t = semAcento(termo.trim());
    if (!t) return { itens: [], total: 0 };

    const achados: { g: (typeof CATALOGO)[number]; pontos: number }[] = [];

    for (const g of CATALOGO) {
      const nome = semAcento(g.nome);
      let pontos = -1;
      if (nome.startsWith(t)) pontos = 0;
      else if (nome.includes(' ' + t)) pontos = 1;
      else if (nome.includes(t)) pontos = 2;
      else if (g.generos.some((x) => semAcento(x).includes(t))) pontos = 3;
      if (pontos >= 0) achados.push({ g, pontos });
    }

    achados.sort((a, b) => a.pontos - b.pontos || a.g.nome.localeCompare(b.g.nome, 'pt-BR'));

    const itens: Produto[] = achados.slice(0, limite).map(({ g }) => ({
      id: String(g.appid),
      nome: g.nome,
      genero: g.generos.join(' / '),
      plataforma: g.plataformas.join(' / '),
      precoOriginal: '',
      precoPromocional: '',
      desconto: 0,
      categorias: g.categorias,
      slug: slugDoAppid(g.appid),
      imagem:
        g.capa ?? `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
    }));

    return { itens, total: achados.length };
  }

  // continua existindo para quem já usava
  buscarNoCatalogo(termo: string, limite = 6): Produto[] {
    return this.buscarCatalogo(termo, limite).itens;
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
      slug: slugDoAppid(j.id),
      estoque: j.estoque,
    };
  }
}