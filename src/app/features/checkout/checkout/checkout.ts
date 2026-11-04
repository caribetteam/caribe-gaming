import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { CheckoutApiService } from '../../../core/services/checkout-api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  carrinhoFacade = inject(CarrinhoFacade);
  authFacade = inject(AuthFacade);
  private fb = inject(FormBuilder);
  private checkoutApi = inject(CheckoutApiService);

  compraFinalizada = signal<boolean>(false);
  processando = signal<boolean>(false);
  mensagemErro = signal<string | null>(null);
  private idempotencyKey: string | null = null;
  metodoPagamento = signal<'pix' | 'cartao' | 'boleto'>('pix');
  segurancaAberta = signal<boolean>(false);

  // Regex estrita para validação de e-mail
  private emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

  formulario: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    cpfCnpj: ['', [Validators.required, Validators.pattern(/^\d{11}(\d{3})?$/)]],
  });

  ngOnInit(): void {
    const usuario = this.authFacade.usuarioAtual();
    if (usuario) {
      if (usuario.displayName) {
        this.formulario.patchValue({ nome: usuario.displayName });
      }
      if (usuario.email) {
        this.formulario.patchValue({ email: usuario.email });
      }
    }
  }

  campoInvalido(nomeCampo: string): boolean {
    const campo = this.formulario.get(nomeCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  selecionarPagamento(metodo: 'pix' | 'cartao' | 'boleto') {
    this.metodoPagamento.set(metodo);
  }

  toggleSeguranca() {
    this.segurancaAberta.update((v) => !v);
  }

  finalizar() {
    if (this.formulario.invalid || this.carrinhoFacade.carrinhoVazio()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.processando.set(true);
    this.mensagemErro.set(null);
    this.idempotencyKey ??= crypto.randomUUID();
    const { nome, email, cpfCnpj } = this.formulario.getRawValue();

    this.checkoutApi
      .criarPedido(this.carrinhoFacade.itens(), this.metodoPagamento(), {
        name: nome,
        email,
        cpfCnpj,
      }, this.idempotencyKey)
      .subscribe({
        next: () => {
          this.carrinhoFacade.limparCarrinho();
          this.compraFinalizada.set(true);
          this.idempotencyKey = null;
          this.processando.set(false);
        },
        error: (error) => {
          this.processando.set(false);
          this.mensagemErro.set(
            error?.error?.error?.message ??
              'Não foi possível processar o pedido. Tente novamente.',
          );
        },
      });
  }
}
