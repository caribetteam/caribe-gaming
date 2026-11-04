import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { Produto, ProdutosService } from '../../../core/services/produtos.service';

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe-jogo.html',
  styleUrl: './detalhe-jogo.css',
})
export class DetalheJogo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly produtosService = inject(ProdutosService);
  private readonly carrinhoFacade = inject(CarrinhoFacade);
  private readonly favoritosService = inject(FavoritosService);

  produto = signal<Produto | null>(null);
  carregando = signal(true);
  naoEncontrado = signal(false);
  mensagem = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => this.produtosService.obterPorSlug(params.get('slug') ?? '')),
      )
      .subscribe({
        next: (produto) => {
          this.produto.set(produto ?? null);
          this.naoEncontrado.set(!produto);
          this.carregando.set(false);
        },
        error: () => {
          this.naoEncontrado.set(true);
          this.carregando.set(false);
        },
      });
  }

  ehFavorito(): boolean {
    return this.produto() ? this.favoritosService.ehFavorito(this.produto()!.id) : false;
  }

  toggleFavorito(): void {
    const produto = this.produto();
    if (!produto) {
      return;
    }

    this.favoritosService.toggleFavorito(produto);
    this.mensagem.set(this.ehFavorito() ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
  }

  adicionarAoCarrinho(): void {
    const produto = this.produto();
    if (!produto) {
      return;
    }

    this.carrinhoFacade.adicionarProduto({
      id: produto.id,
      nome: produto.nome,
      preco: this.precoNumerico(produto.precoPromocional),
      quantidade: 1,
      imagemUrl: produto.imagem,
      plataforma: produto.plataforma,
      categoria: produto.genero,
    });
    this.mensagem.set('Jogo adicionado ao carrinho!');
  }

  comprarAgora(): void {
    this.adicionarAoCarrinho();
    this.router.navigate(['/carrinho']);
  }

  private precoNumerico(preco: string): number {
    if (preco.toLowerCase().includes('grátis')) {
      return 0;
    }
    return Number(preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }
}