import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MercadoPagoService } from '../../../core/services/mercado-pago.service';
import { EmailjsService, PedidoEmail } from '../../../core/services/emailjs.service';

import { gerarNumeroPedido, gerarChaveDemonstracao } from '../../../core/utils/genereate.core';

type FormaFinalizacao = 'mercado-pago' | 'bau';

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

  private mercadoPagoService = inject(MercadoPagoService);
  private emailjsService = inject(EmailjsService);
  private activatedRoute = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  compraFinalizada = signal<boolean>(false);

  formaFinalizacao = signal<FormaFinalizacao>('mercado-pago');

  segurancaAberta = signal<boolean>(false);
  processandoPagamento = signal<boolean>(false);
  erroPagamento = signal<string | null>(null);

  enviandoEmail = signal<boolean>(false);
  emailEnviado = signal<boolean>(false);
  erroEmail = signal<string | null>(null);

  private readonly CHAVE_PEDIDO = 'caribe-pedido-pendente';
  private readonly CHAVE_REFERENCIA = 'caribe-ref';

  private emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

  formulario: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    endereco: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.queryParamMap.subscribe((params) => {
        const paymentId = params.get('payment_id');

        if (paymentId) {
          this.confirmarPagamento(paymentId);
        }
      });
    }

    const usuario = this.authFacade.usuarioAtual();

    if (usuario) {
      if (usuario.displayName) {
        this.formulario.patchValue({
          nome: usuario.displayName,
        });
      }

      if (usuario.email) {
        this.formulario.patchValue({
          email: usuario.email,
        });
      }
    }
  }

  selecionarFinalizacao(tipo: FormaFinalizacao): void {
    this.formaFinalizacao.set(tipo);
    this.erroPagamento.set(null);
    this.erroEmail.set(null);
  }

  private confirmarPagamento(paymentId: string): void {
    this.processandoPagamento.set(true);
    this.erroPagamento.set(null);

    this.mercadoPagoService.consultarPagamento(paymentId).subscribe({
      next: (pagamento) => {
        this.processandoPagamento.set(false);

        const minhaRef = sessionStorage.getItem(this.CHAVE_REFERENCIA);

        const pagamentoAprovado =
          pagamento.status === 'approved' && !!minhaRef && pagamento.externalReference === minhaRef;

        if (pagamentoAprovado) {
          this.formaFinalizacao.set('mercado-pago');

          const chavesPreparadas = this.prepararChavesDemonstrativas();

          if (!chavesPreparadas) {
            return;
          }

          this.carrinhoFacade.limparCarrinho();
          sessionStorage.removeItem(this.CHAVE_REFERENCIA);

          this.compraFinalizada.set(true);

          void this.enviarEmail();

          return;
        }

        if (pagamento.status === 'pending' || pagamento.status === 'in_process') {
          this.erroPagamento.set(
            'Seu pagamento está pendente. A confirmação acontecerá assim que for processado.',
          );

          return;
        }

        this.erroPagamento.set(`Pagamento não aprovado: ${pagamento.status}.`);
      },

      error: () => {
        this.processandoPagamento.set(false);

        this.erroPagamento.set('Não foi possível confirmar o status do pagamento.');
      },
    });
  }

  campoInvalido(nomeCampo: string): boolean {
    const campo = this.formulario.get(nomeCampo);

    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  toggleSeguranca(): void {
    this.segurancaAberta.update((v) => !v);
  }

  private criarPedido(): PedidoEmail {
    const email = this.formulario.get('email')?.value as string;

    const itens = this.carrinhoFacade.itens().map((item) => ({
      ...item,
      chaves: [],
    }));

    return {
      email,
      numeroPedido: gerarNumeroPedido(),
      total: this.carrinhoFacade.total(),
      jogos: itens,
    };
  }

  finalizar(): void {
    if (!this.formulario.valid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.carrinhoFacade.carrinhoVazio()) {
      this.erroPagamento.set('Seu carrinho está vazio.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.processandoPagamento()) {
      return;
    }

    if (this.formaFinalizacao() === 'bau') {
      this.finalizarComBauDeTesouros();
      return;
    }

    this.finalizarComMercadoPago();
  }

  // OPÇÃO 1: MERCADO PAGO
  private finalizarComMercadoPago(): void {
    const email = this.formulario.get('email')?.value as string;

    this.processandoPagamento.set(true);
    this.erroPagamento.set(null);
    this.erroEmail.set(null);

    const pedido = this.criarPedido();

    this.mercadoPagoService.criarPreferencia(this.carrinhoFacade.itens(), email).subscribe({
      next: (preferencia) => {
        sessionStorage.setItem(
          this.CHAVE_PEDIDO,
          JSON.stringify({
            externalReference: preferencia.externalReference,
            pedido,
          }),
        );

        sessionStorage.setItem(this.CHAVE_REFERENCIA, preferencia.externalReference);

        window.location.assign(preferencia.initPoint);
      },

      error: (error) => {
        this.processandoPagamento.set(false);

        this.erroPagamento.set(
          error?.error?.error || 'Não foi possível iniciar o pagamento. Tente novamente.',
        );
      },
    });
  }

  // OPÇÃO 2: BAÚ DE TESOUROS
  // Fluxo demonstrativo, sem cobrança real.
  private finalizarComBauDeTesouros(): void {
    this.processandoPagamento.set(true);
    this.erroPagamento.set(null);
    this.erroEmail.set(null);

    try {
      const pedido = this.criarPedido();

      const externalReference = `demonstracao-${pedido.numeroPedido}`;

      sessionStorage.setItem(
        this.CHAVE_PEDIDO,
        JSON.stringify({
          externalReference,
          pedido,
        }),
      );

      const chavesPreparadas = this.prepararChavesDemonstrativas();

      if (!chavesPreparadas) {
        this.processandoPagamento.set(false);
        return;
      }

      this.carrinhoFacade.limparCarrinho();

      this.compraFinalizada.set(true);
      this.processandoPagamento.set(false);

      void this.enviarEmail();
    } catch (error) {
      console.error('Erro ao concluir pedido demonstrativo:', error);

      this.processandoPagamento.set(false);
      this.erroPagamento.set('Não foi possível abrir seu Baú de Tesouros. Tente novamente.');
    }
  }

  // GERA AS CHAVES DEMONSTRATIVAS
  private prepararChavesDemonstrativas(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const conteudo = sessionStorage.getItem(this.CHAVE_PEDIDO);

    if (!conteudo) {
      this.erroEmail.set('Não foi possível recuperar os dados do pedido.');
      return false;
    }

    try {
      const registro = JSON.parse(conteudo) as {
        externalReference: string;
        pedido: PedidoEmail;
      };

      if (!registro.pedido || !registro.pedido.jogos || !registro.pedido.jogos.length) {
        throw new Error('Dados do pedido inválidos.');
      }

      registro.pedido.jogos = registro.pedido.jogos.map((jogo) => {
        const quantidade = jogo.quantidade ?? 1;

        if (jogo.chaves?.length === quantidade) {
          return jogo;
        }

        return {
          ...jogo,
          chaves: Array.from({ length: quantidade }, () => gerarChaveDemonstracao()),
        };
      });

      sessionStorage.setItem(this.CHAVE_PEDIDO, JSON.stringify(registro));

      this.emailEnviado.set(
        sessionStorage.getItem(`caribe-email-enviado-${registro.externalReference}`) === 'true',
      );

      return true;
    } catch (error) {
      console.error('Erro ao preparar chaves:', error);

      this.erroEmail.set('Não foi possível preparar as chaves do pedido.');

      return false;
    }
  }

  // ENVIO DO E-MAIL
  private async enviarEmail(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.enviandoEmail() || this.emailEnviado()) {
      return;
    }

    this.enviandoEmail.set(true);
    this.erroEmail.set(null);

    try {
      const conteudo = sessionStorage.getItem(this.CHAVE_PEDIDO);

      if (!conteudo) {
        throw new Error('Pedido não encontrado.');
      }

      const registro = JSON.parse(conteudo) as {
        externalReference: string;
        pedido: PedidoEmail;
      };

      if (!registro.pedido.jogos.length) {
        throw new Error('O pedido não possui jogos.');
      }

      await this.emailjsService.enviarPedido(registro.pedido);

      sessionStorage.setItem(`caribe-email-enviado-${registro.externalReference}`, 'true');

      this.emailEnviado.set(true);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);

      this.erroEmail.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o e-mail. Tente novamente.',
      );
    } finally {
      this.enviandoEmail.set(false);
    }
  }
}
