// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { PLATFORM_ID } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
// import { AuthFacade } from '../../../core/facades/auth.facade';
// import { MercadoPagoService } from '../../../core/services/mercado-pago.service';

// @Component({
//   selector: 'app-checkout',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: './checkout.html',
//   styleUrl: './checkout.css',
// })
// export class Checkout implements OnInit {
//   carrinhoFacade = inject(CarrinhoFacade);
//   authFacade = inject(AuthFacade);
//   private mercadoPagoService = inject(MercadoPagoService);
//   private activatedRoute = inject(ActivatedRoute);
//   private platformId = inject(PLATFORM_ID);
//   private fb = inject(FormBuilder);

//   compraFinalizada = signal<boolean>(false);
//   metodoPagamento = signal<'pix' | 'cartao' | 'boleto'>('pix');
//   segurancaAberta = signal<boolean>(false);
//   processandoPagamento = signal<boolean>(false);
//   erroPagamento = signal<string | null>(null);

//   // Regex estrita para validação de e-mail
//   private emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

//   formulario: FormGroup = this.fb.group({
//     nome: ['', [Validators.required, Validators.minLength(3)]],
//     email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
//     endereco: ['', [Validators.required, Validators.minLength(5)]],
//   });

//   ngOnInit(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.activatedRoute.queryParamMap.subscribe((params) => {
//         const paymentId = params.get('payment_id');
//         if (paymentId) {
//           this.processandoPagamento.set(true);
//           this.mercadoPagoService.consultarPagamento(paymentId).subscribe({
//             next: (pagamento) => {
//               this.processandoPagamento.set(false);
//               const minhaRef = sessionStorage.getItem('caribe-ref');
//               if (pagamento.status === 'approved' && pagamento.externalReference === minhaRef) {
//                 this.carrinhoFacade.limparCarrinho();
//                 sessionStorage.removeItem('caribe-ref');
//                 this.compraFinalizada.set(true);
//               } else if (pagamento.status === 'pending' || pagamento.status === 'in_process') {
//                 this.erroPagamento.set(
//                   'Pagamento pendente (Pix/boleto). Ele será confirmado assim que for compensado.',
//                 );
//               } else {
//                 this.erroPagamento.set(`Pagamento não aprovado: ${pagamento.status}.`);
//               }
//             },
//             error: () => {
//               this.processandoPagamento.set(false);
//               this.erroPagamento.set('Não foi possível confirmar o status do pagamento.');
//             },
//           });
//         }
//       });
//     }

//     const usuario = this.authFacade.usuarioAtual();
//     if (usuario) {
//       if (usuario.displayName) {
//         this.formulario.patchValue({ nome: usuario.displayName });
//       }
//       if (usuario.email) {
//         this.formulario.patchValue({ email: usuario.email });
//       }
//     }
//   }

//   campoInvalido(nomeCampo: string): boolean {
//     const campo = this.formulario.get(nomeCampo);
//     return !!(campo && campo.invalid && (campo.dirty || campo.touched));
//   }

//   selecionarPagamento(metodo: 'pix' | 'cartao' | 'boleto') {
//     this.metodoPagamento.set(metodo);
//   }

//   toggleSeguranca() {
//     this.segurancaAberta.update((v) => !v);
//   }

//   finalizar() {
//     if (!this.formulario.valid) {
//       this.formulario.markAllAsTouched();
//       return;
//     }

//     const email = this.formulario.get('email')?.value as string;
//     this.processandoPagamento.set(true);
//     this.erroPagamento.set(null);

//     this.mercadoPagoService.criarPreferencia(this.carrinhoFacade.itens(), email).subscribe({
//       next: (preferencia) => {
//         if (isPlatformBrowser(this.platformId)) {
//           sessionStorage.setItem('caribe-ref', preferencia.externalReference); // liga este navegador ao pedido
//           window.location.assign(preferencia.initPoint);
//         }
//       },
//       error: (error) => {
//         this.processandoPagamento.set(false);
//         this.erroPagamento.set(
//           error?.error?.error || 'Não foi possível iniciar o pagamento. Tente novamente.',
//         );
//       },
//     });
//   }
// }

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MercadoPagoService } from '../../../core/services/mercado-pago.service';
import { EmailjsService, PedidoEmail } from '../../../core/services/emailjs.service';
import {
  gerarNumeroPedido,
  gerarChaveDemonstracao,
} from '../../../core/utils/genereate.core';

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
  private activatedRoute = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  compraFinalizada = signal<boolean>(false);
  metodoPagamento = signal<'pix' | 'cartao' | 'boleto'>('pix');
  segurancaAberta = signal<boolean>(false);
  processandoPagamento = signal<boolean>(false);
  erroPagamento = signal<string | null>(null);

  private emailjsService = inject(EmailjsService);

  enviandoEmail = signal<boolean>(false);
  emailEnviado = signal<boolean>(false);
  erroEmail = signal<string | null>(null);

  private readonly CHAVE_PEDIDO = 'caribe-pedido-pendente';

  // Regex estrita para validação de e-mail
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
          this.processandoPagamento.set(true);
          this.mercadoPagoService.consultarPagamento(paymentId).subscribe({
            next: (pagamento) => {
              const minhaRef = sessionStorage.getItem('caribe-ref');
              if (
                pagamento.status === 'approved' &&
                pagamento.externalReference === minhaRef
              ) {
                // Recupera os jogos e prepara suas chaves demonstrativas
                this.prepararChavesDemonstrativas();
                // O pedido já está salvo na sessão
                this.carrinhoFacade.limparCarrinho();
                sessionStorage.removeItem('caribe-ref');
                this.compraFinalizada.set(true);
              }
              
              this.processandoPagamento.set(false);
              if (pagamento.status === 'approved' && pagamento.externalReference === minhaRef) {
                this.carrinhoFacade.limparCarrinho();
                sessionStorage.removeItem('caribe-ref');
                this.compraFinalizada.set(true);
              } else if (pagamento.status === 'pending' || pagamento.status === 'in_process') {
                this.erroPagamento.set(
                  'Pagamento pendente (Pix/boleto). Ele será confirmado assim que for compensado.',
                );
              } else {
                this.erroPagamento.set(`Pagamento não aprovado: ${pagamento.status}.`);
              }
            },
            error: () => {
              this.processandoPagamento.set(false);
              this.erroPagamento.set('Não foi possível confirmar o status do pagamento.');
            },
          });
        }
      });
    }

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

  private prepararChavesDemonstrativas(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    const conteudo = sessionStorage.getItem(this.CHAVE_PEDIDO);

    if (!conteudo) {
      this.erroEmail.set(
        'Não foi possível recuperar os dados do pedido.'
      );
      return;
    }

    try {

      const registro = JSON.parse(conteudo) as {
        externalReference: string;
        pedido: PedidoEmail;
      };

      // Garante que estamos trabalhando com o pedido correto
      if (!registro.pedido || !registro.pedido.jogos.length) {
        throw new Error('Dados do pedido inválidos.');
      }

      registro.pedido.jogos = registro.pedido.jogos.map(jogo => {

        // Evita gerar novas chaves se o usuário atualizar a página
        if (jogo.chaves?.length === jogo.quantidade) {
          return jogo;
        }

        const quantidade = jogo.quantidade ?? 1;


        return {
          ...jogo,
          chaves: Array.from(
            { length: quantidade},
            () => gerarChaveDemonstracao()
          )
        };
      });

      // Persiste as chaves para que não sejam alteradas em uma nova tentativa
      sessionStorage.setItem(
        this.CHAVE_PEDIDO,
        JSON.stringify(registro)
      );


      this.emailEnviado.set(
        sessionStorage.getItem(
          `caribe-email-enviado-${registro.externalReference}`
        ) === 'true'
      );

    } catch (error) {

      console.error('Erro ao preparar chaves:', error);

      this.erroEmail.set(
        'Não foi possível preparar as chaves do pedido.'
      );
    }
  }

  private async enviarEmail(): Promise<void> {

    if (!isPlatformBrowser(this.platformId)) return;

    if (this.enviandoEmail() || this.emailEnviado()) return;

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

      // Registra o envio para evitar disparos repetidos
      sessionStorage.setItem(
        `caribe-email-enviado-${registro.externalReference}`,
        'true'
      );

      this.emailEnviado.set(true);

    } catch (error) {

      console.error('Erro ao enviar e-mail:', error);

      this.erroEmail.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o e-mail. Tente novamente.'
      );

    } finally {

      this.enviandoEmail.set(false);

    }
  }

  finalizar() {
    if (!this.formulario.valid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const email = this.formulario.get('email')?.value as string;

    const itens = this.carrinhoFacade.itens().map(item => ({
      ...item
    }));

    const pedido: PedidoEmail = {
      email,
      numeroPedido: gerarNumeroPedido(),
      total: this.carrinhoFacade.total(),
      jogos: itens.map(item => ({
        ...item,
        chaves: []
      }))
    };

    this.processandoPagamento.set(true);
    this.erroPagamento.set(null);

    // Simula a finalização da compra para testes
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(
        this.CHAVE_PEDIDO,
        JSON.stringify({
          externalReference: pedido.numeroPedido,
          pedido
        })
      );
    }

    this.prepararChavesDemonstrativas();
    this.enviarEmail();

    this.compraFinalizada.set(true);
    this.processandoPagamento.set(false);  
  }
}