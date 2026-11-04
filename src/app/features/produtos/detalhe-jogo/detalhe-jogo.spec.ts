import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProdutosService } from '../../../core/services/produtos.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { FavoritosService } from '../../../core/services/favoritos.service';

import { DetalheJogo } from './detalhe-jogo';

describe('DetalheJogo', () => {
  let component: DetalheJogo;
  let fixture: ComponentFixture<DetalheJogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheJogo],
      providers: [
        provideRouter([]),
        {
          provide: ProdutosService,
          useValue: { obterPorSlug: () => of(undefined) },
        },
        {
          provide: CarrinhoFacade,
          useValue: { adicionarProduto: vi.fn() },
        },
        {
          provide: FavoritosService,
          useValue: { ehFavorito: () => false, toggleFavorito: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheJogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
