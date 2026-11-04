import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Checkout } from './checkout';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { CheckoutApiService } from '../../../core/services/checkout-api.service';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        provideRouter([]),
        {
          provide: CarrinhoFacade,
          useValue: {
            itens: vi.fn().mockReturnValue([]),
            quantidade: vi.fn().mockReturnValue(0),
            total: vi.fn().mockReturnValue(0),
            carrinhoVazio: vi.fn().mockReturnValue(true),
            limparCarrinho: vi.fn(),
          },
        },
        {
          provide: AuthFacade,
          useValue: { usuarioAtual: vi.fn().mockReturnValue(null) },
        },
        {
          provide: CheckoutApiService,
          useValue: { criarPedido: vi.fn().mockReturnValue(of({ order: {} })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
