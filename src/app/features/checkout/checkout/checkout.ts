import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { EmailjsService, PedidoEmail } from '../../../core/services/emailjs.service';
import {
  gerarNumeroPedido,
  gerarChaveDemonstracao,
} from '../../../core/utils/genereate.core';

type Metodo = 'pix' | 'cartao' | 'boleto';
type Etapa = 'dados' | 'pix' | 'boleto';

interface BoletoGerado {
  linhaDigitavel: string;
  vencimento: string;
  barras: { w: number; preta: boolean }[];
}

interface PedidoConfirmado {
  numero: string;
  total: number;
  metodo: Metodo;
}

// ---------- utilitários da simulação ----------

function digitosAleatorios(qtd: number): string {
  let s = '';
  for (let i = 0; i < qtd; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// Validade do cartão: MM/AA e ainda não vencido
function validadeCartao(controle: AbstractControl): ValidationErrors | null {
  const valor = String(controle.value ?? '');
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valor);
  if (!m) return { formato: true };
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  const primeiroDiaDoMesSeguinte = new Date(ano, mes, 1);
  return primeiroDiaDoMesSeguinte > new Date() ? null : { expirado: true };
}

// QR Code apenas visual (não é lido por nenhum app): 3 quadrados de canto + pontos
// gerados a partir do código PIX, para sempre sair igual para o mesmo código.
function gerarPontosQr(semente: string): { x: number; y: number }[] {
  const n = 29;
  let h = 2166136261;
  for (const c of semente) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  if (h === 0) h = 1;
  const aleatorio = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };

  const m: boolean[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => aleatorio() > 0.5),
  );

  const cantos: [number, number][] = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];

  for (const [x0, y0] of cantos) {
    // faixa branca em volta do quadrado
    for (let y = y0 - 1; y <= y0 + 7; y++) {
      for (let x = x0 - 1; x <= x0 + 7; x++) {
        if (x >= 0 && y >= 0 && x < n && y < n) m[y][x] = false;
      }
    }
    // quadrado 7x7: borda preta, meio branco, centro 3x3 preto
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const borda = dx === 0 || dy === 0 || dx === 6 || dy === 6;
        const centro = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        m[y0 + dy][x0 + dx] = borda || centro;
      }
    }
  }

  const pontos: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (m[y][x]) pontos.push({ x, y });
    }
  }
  return pontos;
}

function gerarBoleto(total: number, vencimento: Date): BoletoGerado {
  const base = Date.UTC(1997, 9, 7);
  const alvo = Date.UTC(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
  const fator = String(Math.floor((alvo - base) / 86400000)).padStart(4, '0').slice(-4);
  const valor = String(Math.round(total * 100)).padStart(10, '0').slice(-10);

  const campo1 = '34191' + digitosAleatorios(5);
  const campo2 = digitosAleatorios(11);
  const campo3 = digitosAleatorios(11);
  const dv = digitosAleatorios(1);

  const linhaDigitavel =
    `${campo1.slice(0, 5)}.${campo1.slice(5)} ` +
    `${campo2.slice(0, 5)}.${campo2.slice(5)} ` +
    `${campo3.slice(0, 5)}.${campo3.slice(5)} ` +
    `${dv} ${fator}${valor}`;

  const digitos = (campo1 + campo2 + campo3 + dv + fator + valor).split('').map(Number);
  const barras: { w: number; preta: boolean }[] = [];
  for (const d of digitos) {
    barras.push({ w: (1 + (d % 4)) * 2, preta: true });
    barras.push({ w: (1 + (d % 3)) * 2, preta: false });
  }

  return { linhaDigitavel, vencimento: vencimento.toLocaleDateString('pt-BR'), barras };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {
  carrinhoFacade = inject(CarrinhoFacade);
  authFacade = inject(AuthFacade);
  private emailjsService = inject(EmailjsService);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  // estado geral
  etapa = signal<Etapa>('dados');
  compraFinalizada = signal<boolean>(false);
  metodoPagamento = signal<Metodo>('pix');
  segurancaAberta = signal<boolean>(false);
  processandoPagamento = signal<boolean>(false);
  erroPagamento = signal<string | null>(null);

  // O endereço só é pedido por cartão (antifraude) e boleto (dados do pagador). PIX não precisa.
  precisaEndereco = computed(() => this.metodoPagamento() !== 'pix');

  // pedido
  pedidoAtual = signal<PedidoEmail | null>(null);
  pedidoConfirmado = signal<PedidoConfirmado | null>(null);
  totalPedido = computed(() => this.pedidoAtual()?.total ?? 0);

  // PIX
  pixCodigo = signal<string>('');
  qrPontos = signal<{ x: number; y: number }[]>([]);
  segundosRestantes = signal<number>(0);
  tempoFormatado = computed(() => {
    const s = this.segundosRestantes();
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  });

  // Boleto
  boleto = signal<BoletoGerado | null>(null);

  // Cartão
  bandeira = signal<string>('');
  parcelasOpcoes = computed(() => {
    const total = this.carrinhoFacade.total();
    return Array.from({ length: 12 }, (_, i) => ({
      n: i + 1,
      texto: `${i + 1}x de ${this.moeda(total / (i + 1))} sem juros`,
    }));
  });

  // "copiado!" nos botões de copiar
  copiado = signal<'pix' | 'boleto' | null>(null);

  // e-mail com as chaves
  enviandoEmail = signal<boolean>(false);
  emailEnviado = signal<boolean>(false);
  erroEmail = signal<string | null>(null);

  private readonly CHAVE_PEDIDO = 'caribe-pedido-pendente';
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervalo?: ReturnType<typeof setInterval>;

  // Regex estrita para validação de e-mail
  private emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

  formulario: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    endereco: ['', [Validators.required, Validators.minLength(5)]],
    cartao: this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
      titular: ['', [Validators.required, Validators.minLength(3)]],
      validade: ['', [Validators.required, validadeCartao]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      parcelas: [1, [Validators.required]],
    }),
  });

  get cartao(): FormGroup {
    return this.formulario.get('cartao') as FormGroup;
  }

  get endereco(): AbstractControl {
    return this.formulario.get('endereco') as AbstractControl;
  }

  ngOnInit(): void {
    // PIX é o método inicial: cartão e endereço ficam desligados (não entram na validação)
    this.cartao.disable();
    this.endereco.disable();

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

  ngOnDestroy(): void {
    this.limparTimers();
  }

  // ---------- auxiliares de tela ----------

  moeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  nomeMetodo(metodo: Metodo): string {
    return { pix: 'PIX', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' }[metodo];
  }

  get rotuloBotao(): string {
    if (this.processandoPagamento()) return 'Processando...';
    switch (this.metodoPagamento()) {
      case 'pix':
        return 'Gerar QR Code PIX';
      case 'boleto':
        return 'Gerar boleto';
      default:
        return `Pagar ${this.moeda(this.carrinhoFacade.total())}`;
    }
  }

  campoInvalido(caminho: string): boolean {
    const campo = this.formulario.get(caminho);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  selecionarPagamento(metodo: Metodo) {
    this.metodoPagamento.set(metodo);
    this.erroPagamento.set(null);

    // campos do cartão: só no cartão
    if (metodo === 'cartao') {
      this.cartao.enable();
    } else {
      this.cartao.disable();
    }

    // endereço: cartão e boleto pedem; PIX não
    if (metodo === 'pix') {
      this.endereco.disable();
    } else {
      this.endereco.enable();
    }
  }

  toggleSeguranca() {
    this.segurancaAberta.update((v) => !v);
  }

  // ---------- máscaras do cartão ----------

  mascararNumero(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 16);
    this.cartao.get('numero')?.setValue(digitos.replace(/(.{4})/g, '$1 ').trim());

    if (digitos.startsWith('4')) this.bandeira.set('VISA');
    else if (/^5[1-5]/.test(digitos) || /^2[2-7]/.test(digitos)) this.bandeira.set('MASTERCARD');
    else this.bandeira.set('');
  }

  mascararValidade(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const d = input.value.replace(/\D/g, '').slice(0, 4);
    this.cartao.get('validade')?.setValue(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  }

  mascararCvv(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.cartao.get('cvv')?.setValue(input.value.replace(/\D/g, '').slice(0, 4));
  }

  maiusculasTitular(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.cartao.get('titular')?.setValue(input.value.toUpperCase());
  }

  // ---------- fluxo principal ----------

  finalizar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (this.processandoPagamento()) return;

    this.erroPagamento.set(null);
    this.montarPedido();

    switch (this.metodoPagamento()) {
      case 'pix':
        this.processandoPagamento.set(true);
        this.agendar(() => this.iniciarPix(), 900);
        break;
      case 'boleto':
        this.processandoPagamento.set(true);
        this.agendar(() => this.iniciarBoleto(), 900);
        break;
      default:
        this.pagarComCartao();
    }
  }

  voltarParaDados(): void {
    this.limparTimers();
    this.processandoPagamento.set(false);
    this.etapa.set('dados');
    this.pedidoAtual.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.CHAVE_PEDIDO);
    }
  }

  // Cria o pedido (cópia dos itens do carrinho) e guarda na sessão
  private montarPedido(): void {
    const email = this.formulario.get('email')?.value as string;
    const itens = this.carrinhoFacade.itens().map((item) => ({ ...item }));

    const pedido: PedidoEmail = {
      email,
      numeroPedido: gerarNumeroPedido(),
      total: this.carrinhoFacade.total(),
      jogos: itens.map((item) => ({
        ...item,
        chaves: [],
      })),
    };

    this.pedidoAtual.set(pedido);

    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(
        this.CHAVE_PEDIDO,
        JSON.stringify({ externalReference: pedido.numeroPedido, pedido }),
      );
    }
  }

  // ---------- PIX ----------

  private montarPixCopiaECola(valor: number): string {
    const campo = (id: string, conteudo: string) =>
      id + String(conteudo.length).padStart(2, '0') + conteudo;

    const conta = campo('00', 'br.gov.bcb.pix') + campo('01', crypto.randomUUID());
    const corpo =
      campo('00', '01') +
      campo('26', conta) +
      campo('52', '0000') +
      campo('53', '986') +
      campo('54', valor.toFixed(2)) +
      campo('58', 'BR') +
      campo('59', 'CARIBES GAMING') +
      campo('60', 'RIO DE JANEIRO') +
      campo('62', campo('05', '***')) +
      '6304';

    const crcFalso = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');

    return corpo + crcFalso;
  }

  private iniciarPix(): void {
    const total = this.totalPedido();
    const codigo = this.montarPixCopiaECola(total);

    this.pixCodigo.set(codigo);
    this.qrPontos.set(gerarPontosQr(codigo));
    this.segundosRestantes.set(15 * 60);
    this.processandoPagamento.set(false);
    this.etapa.set('pix');

    this.intervalo = setInterval(() => {
      const restante = this.segundosRestantes() - 1;
      this.segundosRestantes.set(restante);

      if (restante <= 0) {
        this.limparTimers();
        this.etapa.set('dados');
        this.erroPagamento.set('O código PIX expirou. Gere um novo para continuar.');
      }
    }, 1000);

    // "o banco avisou que o PIX caiu"
    this.agendar(() => this.concluirCompra(), 10000);
  }

  simularPagamentoAgora(): void {
    if (this.processandoPagamento()) return;
    this.concluirCompra();
  }

  // ---------- Boleto ----------

  private iniciarBoleto(): void {
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 3);

    this.boleto.set(gerarBoleto(this.totalPedido(), vencimento));
    this.processandoPagamento.set(false);
    this.etapa.set('boleto');
  }

  simularPagamentoBoleto(): void {
    if (this.processandoPagamento()) return;
    this.processandoPagamento.set(true);
    this.agendar(() => this.concluirCompra(), 2500);
  }

  // ---------- Cartão ----------

  private pagarComCartao(): void {
    this.processandoPagamento.set(true);
    const numero = String(this.cartao.get('numero')?.value ?? '').replace(/\s/g, '');

    this.agendar(() => {
      if (numero === '4000000000000002') {
        this.processandoPagamento.set(false);
        this.erroPagamento.set(
          'Cartão recusado pelo banco emissor. Confira os dados ou tente outro cartão.',
        );
        return;
      }
      this.concluirCompra();
    }, 2500);
  }

  // ---------- conclusão ----------

  async copiar(texto: string, alvo: 'pix' | 'boleto'): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      this.copiado.set(alvo);
      this.agendar(() => this.copiado.set(null), 2500);
    } catch {
      /* sem permissão para copiar: não marca como copiado */
    }
  }

  // Pagamento aprovado: gera as chaves, manda o e-mail e ESVAZIA O CARRINHO
  private concluirCompra(): void {
    if (this.compraFinalizada()) return;

    const pedido = this.pedidoAtual();
    if (!pedido) return;

    this.limparTimers();

    this.pedidoConfirmado.set({
      numero: pedido.numeroPedido,
      total: pedido.total,
      metodo: this.metodoPagamento(),
    });

    this.prepararChavesDemonstrativas();
    void this.enviarEmail();

    // não guarda nenhum dado do cartão
    this.cartao.reset({ numero: '', titular: '', validade: '', cvv: '', parcelas: 1 });
    this.bandeira.set('');

    // limpa o carrinho (local, contador do baú e nuvem)
    this.carrinhoFacade.limparCarrinho();

    this.processandoPagamento.set(false);
    this.etapa.set('dados');
    this.compraFinalizada.set(true);

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  reenviarEmail(): void {
    void this.enviarEmail();
  }

  private prepararChavesDemonstrativas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const conteudo = sessionStorage.getItem(this.CHAVE_PEDIDO);

    if (!conteudo) {
      this.erroEmail.set('Não foi possível recuperar os dados do pedido.');
      return;
    }

    try {
      const registro = JSON.parse(conteudo) as {
        externalReference: string;
        pedido: PedidoEmail;
      };

      if (!registro.pedido || !registro.pedido.jogos.length) {
        throw new Error('Dados do pedido inválidos.');
      }

      registro.pedido.jogos = registro.pedido.jogos.map((jogo) => {
        // Evita gerar novas chaves se o usuário atualizar a página
        if (jogo.chaves?.length === jogo.quantidade) {
          return jogo;
        }

        const quantidade = jogo.quantidade ?? 1;

        return {
          ...jogo,
          chaves: Array.from({ length: quantidade }, () => gerarChaveDemonstracao()),
        };
      });

      sessionStorage.setItem(this.CHAVE_PEDIDO, JSON.stringify(registro));

      this.emailEnviado.set(
        sessionStorage.getItem(`caribe-email-enviado-${registro.externalReference}`) === 'true',
      );
    } catch (error) {
      console.error('Erro ao preparar chaves:', error);
      this.erroEmail.set('Não foi possível preparar as chaves do pedido.');
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

  // ---------- timers ----------

  private agendar(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private limparTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
  }
}