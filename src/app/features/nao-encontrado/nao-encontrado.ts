// src/app/features/nao-encontrado/nao-encontrado.ts
// Página 404 com um joguinho: afunde os navios fantasma antes que eles escapem!
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Bala { x: number; y: number; }
interface Inimigo { x: number; y: number; vel: number; fase: number; escala: number; }
interface Respingo { x: number; y: number; t: number; }

const LARGURA = 720;
const ALTURA = 420;
const MAR = 318; // altura da linha do mar onde fica o seu navio
const VIDAS = 3;
const CHAVE_RECORDE = 'caribe_404_recorde';

@Component({
  selector: 'app-nao-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="pagina-404">
      <div class="topo">
        <div class="codigo">4<span>0</span>4</div>
        <h1>Navegamos para águas desconhecidas!</h1>
        <p>
          Essa página não existe, ou o tesouro já foi levado. Enquanto isso, que tal afundar uns
          navios fantasma?
        </p>
      </div>

      <div class="jogo">
        <div class="placar" aria-live="polite">
          <span>⚓ Pontos: <strong>{{ pontos() }}</strong></span>
          <span class="vidas" [attr.aria-label]="vidas() + ' vidas'">
            @for (v of [1, 2, 3]; track v) {
              <i [class.perdida]="v > vidas()">♥</i>
            }
          </span>
          <span>🏆 Recorde: <strong>{{ recorde() }}</strong></span>
        </div>

        <div class="tela-jogo">
          <canvas
            #tela
            [attr.width]="largura"
            [attr.height]="altura"
            aria-label="Joguinho: afunde os navios fantasma"
            (pointermove)="mover($event)"
            (pointerdown)="tocar($event)"
          ></canvas>

          @if (estado() !== 'jogando') {
            <div class="cobertura">
              @if (estado() === 'parado') {
                <h2>Defenda o Caribe!</h2>
                <p>
                  Mova o mouse (ou use ← →) para guiar o navio.<br />
                  Clique, toque ou aperte <kbd>Espaço</kbd> para disparar o canhão.<br />
                  Navios que escapam pela esquerda custam uma vida.
                </p>
                <button type="button" class="btn-jogo" (click)="iniciar()">Zarpar!</button>
              } @else {
                <h2>Seu navio afundou!</h2>
                <p class="resultado">
                  Você fez <strong>{{ pontos() }}</strong> pontos
                  @if (novoRecorde()) { — <span class="novo">novo recorde! 🎉</span> }
                </p>
                <button type="button" class="btn-jogo" (click)="iniciar()">Jogar de novo</button>
              }
            </div>
          }
        </div>
      </div>

      <div class="acoes">
        <a routerLink="/" class="btn-link principal">Voltar ao porto</a>
        <a routerLink="/jogos" class="btn-link">Ver os jogos</a>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }

      .pagina-404 {
        margin-top: 130px;
        padding: 20px 20px 60px;
        color: #fff;
        text-align: center;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      .codigo {
        font-size: clamp(4rem, 14vw, 8rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: 6px;
        text-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      }

      .codigo span {
        display: inline-block;
        color: #4fc3e8;
        animation: balanco 2.6s ease-in-out infinite;
      }

      @keyframes balanco {
        0%, 100% { transform: translateY(0) rotate(-6deg); }
        50% { transform: translateY(-8px) rotate(6deg); }
      }

      h1 { margin: 10px 0 8px; font-size: clamp(1.3rem, 4vw, 2rem); }
      .topo p { margin: 0 auto 26px; max-width: 520px; color: rgba(255, 255, 255, 0.78); }

      .jogo { max-width: 720px; margin: 0 auto; }

      .placar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: #14213a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: none;
        border-radius: 14px 14px 0 0;
        font-size: 0.9rem;
      }

      .vidas i { font-style: normal; color: #ff4757; font-size: 1.25rem; margin: 0 2px; }
      .vidas i.perdida { color: rgba(255, 255, 255, 0.2); }

      .tela-jogo {
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0 0 14px 14px;
        overflow: hidden;
        background: #0a1626;
      }

      canvas {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 720 / 420;
        touch-action: none;
        cursor: crosshair;
      }

      .cobertura {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;
        background: rgba(6, 18, 34, 0.78);
        backdrop-filter: blur(2px);
      }

      .cobertura h2 { margin: 0; font-size: 1.6rem; color: #4fc3e8; }
      .cobertura p { margin: 0; max-width: 420px; line-height: 1.55; color: rgba(255, 255, 255, 0.85); font-size: 0.92rem; }
      .resultado strong { color: #ffc83d; font-size: 1.2rem; }
      .novo { color: #4ade80; font-weight: 800; }

      kbd {
        padding: 1px 7px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 0.8rem;
      }

      .btn-jogo {
        margin-top: 6px;
        padding: 12px 30px;
        border: none;
        border-radius: 12px;
        background: #0e7fa8;
        color: #fff;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(14, 127, 168, 0.5);
        transition: background 0.2s, transform 0.1s;
      }

      .btn-jogo:hover { background: #4fc3e8; color: #06232f; }
      .btn-jogo:active { transform: scale(0.97); }

      .acoes { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 28px; }

      .btn-link {
        padding: 11px 24px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        transition: background 0.2s, border-color 0.2s;
      }

      .btn-link:hover { border-color: #4fc3e8; background: rgba(79, 195, 232, 0.15); }
      .btn-link.principal { background: #0e7fa8; border-color: #0e7fa8; }
      .btn-link.principal:hover { background: #4fc3e8; color: #06232f; }

      @media (max-width: 768px) {
        .pagina-404 { margin-top: 90px; padding: 12px 12px 40px; }
        .placar { font-size: 0.78rem; padding: 8px 10px; }
        .cobertura { padding: 12px; gap: 6px; }
        .cobertura h2 { font-size: 1.2rem; }
        .cobertura p { font-size: 0.8rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .codigo span { animation: none; }
      }
    `,
  ],
})
export class NaoEncontrado implements OnDestroy {
  @ViewChild('tela', { static: true }) telaRef!: ElementRef<HTMLCanvasElement>;

  readonly largura = LARGURA;
  readonly altura = ALTURA;

  estado = signal<'parado' | 'jogando' | 'fim'>('parado');
  pontos = signal(0);
  vidas = signal(VIDAS);
  recorde = signal(0);
  novoRecorde = signal(false);

  private platformId = inject(PLATFORM_ID);
  private ctx: CanvasRenderingContext2D | null = null;
  private raf = 0;
  private ultimo = 0;
  private tempo = 0;

  private jogadorX = LARGURA / 2;
  private balas: Bala[] = [];
  private inimigos: Inimigo[] = [];
  private respingos: Respingo[] = [];
  private proximoInimigo = 0.8;
  private recarga = 0;
  private esquerda = false;
  private direita = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.ctx = this.telaRef.nativeElement.getContext('2d');
      try {
        this.recorde.set(Number(localStorage.getItem(CHAVE_RECORDE)) || 0);
      } catch {
        /* sem localStorage: o recorde só vale nesta visita */
      }
      this.ultimo = performance.now();
      this.raf = requestAnimationFrame((t) => this.quadro(t));
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
  }

  // ---------- controles ----------
  iniciar(): void {
    this.pontos.set(0);
    this.vidas.set(VIDAS);
    this.novoRecorde.set(false);
    this.balas = [];
    this.inimigos = [];
    this.respingos = [];
    this.proximoInimigo = 0.8;
    this.recarga = 0;
    this.jogadorX = LARGURA / 2;
    this.estado.set('jogando');
  }

  mover(e: PointerEvent): void {
    const r = this.telaRef.nativeElement.getBoundingClientRect();
    if (!r.width) return;
    this.jogadorX = this.limitar(((e.clientX - r.left) * LARGURA) / r.width);
  }

  tocar(e: PointerEvent): void {
    this.mover(e);
    this.atirar();
  }

  @HostListener('window:keydown', ['$event'])
  aoApertar(e: KeyboardEvent): void {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.esquerda = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') this.direita = true;
    if (e.code === 'Space' && this.estado() === 'jogando') {
      e.preventDefault();
      this.atirar();
    }
  }

  @HostListener('window:keyup', ['$event'])
  aoSoltar(e: KeyboardEvent): void {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.esquerda = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') this.direita = false;
  }

  private atirar(): void {
    if (this.estado() !== 'jogando' || this.recarga > 0) return;
    this.recarga = 0.35;
    this.balas.push({ x: this.jogadorX, y: MAR - 34 });
  }

  private limitar(x: number): number {
    return Math.max(40, Math.min(LARGURA - 40, x));
  }

  // ---------- laço do jogo ----------
  private quadro(agora: number): void {
    const dt = Math.min(0.05, (agora - this.ultimo) / 1000);
    this.ultimo = agora;
    this.tempo += dt;

    if (this.estado() === 'jogando') this.atualizar(dt);
    this.desenhar();

    this.raf = requestAnimationFrame((t) => this.quadro(t));
  }

  private atualizar(dt: number): void {
    // navio do jogador (teclado)
    if (this.esquerda) this.jogadorX = this.limitar(this.jogadorX - 340 * dt);
    if (this.direita) this.jogadorX = this.limitar(this.jogadorX + 340 * dt);
    this.recarga = Math.max(0, this.recarga - dt);

    // novos navios inimigos (cada vez mais rápidos)
    const nivel = Math.floor(this.pontos() / 80);
    this.proximoInimigo -= dt;
    if (this.proximoInimigo <= 0) {
      this.inimigos.push({
        x: LARGURA + 50,
        y: 105 + Math.random() * 150,
        vel: 55 + nivel * 9 + Math.random() * 35,
        fase: Math.random() * 6.28,
        escala: 0.85 + Math.random() * 0.35,
      });
      this.proximoInimigo = Math.max(0.5, 1.5 - nivel * 0.1) + Math.random() * 0.5;
    }

    // projéteis
    for (const b of this.balas) b.y -= 470 * dt;
    this.balas = this.balas.filter((b) => b.y > -10);

    // inimigos: andam, balançam e podem escapar
    for (const i of this.inimigos) i.x -= i.vel * dt;
    const escaparam = this.inimigos.filter((i) => i.x < -60);
    this.inimigos = this.inimigos.filter((i) => i.x >= -60);
    for (let k = 0; k < escaparam.length; k++) this.perderVida();

    // acertos
    for (const b of [...this.balas]) {
      const alvo = this.inimigos.find(
        (i) => Math.abs(b.x - i.x) < 36 * i.escala && Math.abs(b.y - (i.y + 8)) < 24 * i.escala,
      );
      if (!alvo) continue;
      this.balas = this.balas.filter((x) => x !== b);
      this.inimigos = this.inimigos.filter((x) => x !== alvo);
      this.respingos.push({ x: alvo.x, y: alvo.y + 12, t: 0 });
      this.pontos.update((p) => p + 10);
    }

    this.respingos.forEach((r) => (r.t += dt));
    this.respingos = this.respingos.filter((r) => r.t < 0.6);
  }

  private perderVida(): void {
    if (this.estado() !== 'jogando') return;
    this.vidas.update((v) => v - 1);
    if (this.vidas() > 0) return;

    this.estado.set('fim');
    if (this.pontos() > this.recorde()) {
      this.recorde.set(this.pontos());
      this.novoRecorde.set(true);
      try {
        localStorage.setItem(CHAVE_RECORDE, String(this.pontos()));
      } catch {
        /* ignora */
      }
    }
  }

  // ---------- desenho ----------
  private desenhar(): void {
    const c = this.ctx;
    if (!c) return;

    // céu
    const ceu = c.createLinearGradient(0, 0, 0, MAR);
    ceu.addColorStop(0, '#0f3a63');
    ceu.addColorStop(0.65, '#2c8cc2');
    ceu.addColorStop(1, '#ffb86b');
    c.fillStyle = ceu;
    c.fillRect(0, 0, LARGURA, ALTURA);

    // sol
    c.fillStyle = 'rgba(255, 214, 120, 0.9)';
    c.beginPath();
    c.arc(560, MAR - 38, 34, 0, Math.PI * 2);
    c.fill();

    // mar
    const mar = c.createLinearGradient(0, MAR - 20, 0, ALTURA);
    mar.addColorStop(0, '#1fa5c9');
    mar.addColorStop(1, '#0a2a4a');
    c.fillStyle = mar;
    c.fillRect(0, MAR - 20, LARGURA, ALTURA - MAR + 20);

    // ondas
    c.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    c.lineWidth = 2;
    for (let linha = 0; linha < 4; linha++) {
      const y = MAR + linha * 22;
      c.beginPath();
      for (let x = 0; x <= LARGURA; x += 8) {
        const yy = y + Math.sin(x / 26 + this.tempo * 2 + linha) * 3;
        if (x === 0) c.moveTo(x, yy);
        else c.lineTo(x, yy);
      }
      c.stroke();
    }

    // inimigos
    for (const i of this.inimigos) {
      const balanco = Math.sin(this.tempo * 2.4 + i.fase) * 4;
      this.navio(c, i.x, i.y + balanco, i.escala, '#2b2336', '#cfc6b8', '#111', true);
    }

    // projéteis
    c.fillStyle = '#1b1b1b';
    for (const b of this.balas) {
      c.beginPath();
      c.arc(b.x, b.y, 5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255, 200, 80, 0.35)';
      c.beginPath();
      c.arc(b.x, b.y + 9, 3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1b1b1b';
    }

    // respingos
    for (const r of this.respingos) {
      const p = r.t / 0.6;
      c.strokeStyle = `rgba(255, 255, 255, ${1 - p})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(r.x, r.y, 8 + p * 34, 0, Math.PI * 2);
      c.stroke();
    }

    // navio do jogador
    const balancoJogador = Math.sin(this.tempo * 3) * 2.5;
    this.navio(c, this.jogadorX, MAR - 6 + balancoJogador, 1.05, '#7a4a21', '#fff7e0', '#e63946', false);
    c.fillStyle = '#222';
    c.fillRect(this.jogadorX - 4, MAR - 40 + balancoJogador, 8, 14); // canhão
  }

  private navio(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    escala: number,
    casco: string,
    vela: string,
    bandeira: string,
    inimigo: boolean,
  ): void {
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);

    // casco
    c.fillStyle = casco;
    c.beginPath();
    c.moveTo(-36, 0);
    c.lineTo(36, 0);
    c.lineTo(25, 17);
    c.lineTo(-25, 17);
    c.closePath();
    c.fill();

    // mastro e velas
    c.fillStyle = '#3b2a1a';
    c.fillRect(-2, -44, 4, 44);
    c.fillStyle = vela;
    c.beginPath();
    c.moveTo(3, -40);
    c.lineTo(28, -8);
    c.lineTo(3, -8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-3, -34);
    c.lineTo(-22, -8);
    c.lineTo(-3, -8);
    c.closePath();
    c.fill();

    // bandeira (a dos inimigos tem uma carinha de caveira)
    c.fillStyle = bandeira;
    c.fillRect(2, -52, 14, 9);
    if (inimigo) {
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(9, -48, 2.6, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }
}