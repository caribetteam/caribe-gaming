import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AuthFacade } from '../../core/facades/auth.facade';
import { ProdutosService } from '../../core/services/produtos.service';
import { PainelAdminMockService } from '../../core/services/painel-admin-mock.service';

type SecaoAtiva = 'produtos' | 'pedidos' | 'usuarios' | null;

export interface PedidoAdmin {
  id: string;
  cliente: string;
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Enviado';
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  perfil: 'Administrador' | 'Usuário';
  ativo: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly STORAGE_KEY_USUARIOS = 'admin_usuarios_cadastrados';

  authFacade = inject(AuthFacade);
  private produtosService = inject(ProdutosService);
  private painelAdminMockService = inject(PainelAdminMockService);
  private fb = inject(FormBuilder);

  secaoAtiva = signal<SecaoAtiva>(null);
  feedbackMsg = signal<string | null>(null);

  private produtosLista = signal<any[]>([]);
  pedidos = signal<PedidoAdmin[]>([]);
  usuarios = signal<UsuarioAdmin[]>([]);

  produtosCadastrados = computed(() => this.produtosLista().length);
  pedidosPendentes = computed(() => this.pedidos().filter((p) => p.status === 'Pendente').length);
  usuariosCadastrados = computed(() => this.usuarios().length);

  produtoForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    estoque: [1, [Validators.required, Validators.min(0)]],
    descricao: [''],
  });

  usuarioForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    perfil: ['Usuário' as 'Administrador' | 'Usuário', [Validators.required]],
    ativo: [true],
  });

  constructor() {
    effect(() => {
      const atual = this.authFacade.usuarioAtual();
      if (!atual?.email) {
        return;
      }

      const listaAtual = this.usuarios();
      const jaExiste = listaAtual.some((u) => u.email.toLowerCase() === atual.email!.toLowerCase());

      if (!jaExiste) {
        const novo: UsuarioAdmin = {
          id: `USR-${Date.now()}`,
          nome: atual.displayName?.trim() || atual.email.split('@')[0],
          email: atual.email.trim(),
          perfil: this.authFacade.ehAdmin() ? 'Administrador' : 'Usuário',
          ativo: true,
        };
        this.salvarUsuarios([...listaAtual, novo]);
      }
    });
  }

  ngOnInit(): void {
    this.produtosService.obterProdutos().subscribe({
      next: (produtos) => this.produtosLista.set(produtos ?? []),
      error: () => this.notificar('Não foi possível carregar os produtos.'),
    });

    this.painelAdminMockService.obterPedidosPendentes().subscribe({
      next: (lista: any[]) => {
        const normalizados: PedidoAdmin[] = (lista ?? []).map((item, idx) => ({
          id: item?.id ?? `PED-${100 + idx}`,
          cliente: item?.cliente ?? `Cliente #${idx + 1}`,
          total: Number(item?.total ?? 0),
          status: item?.status ?? 'Pendente',
        }));
        this.pedidos.set(normalizados);
      },
    });

    this.recarregarUsuarios();
  }

  recarregarUsuarios(): void {
    const salvo = localStorage.getItem(this.STORAGE_KEY_USUARIOS);
    if (salvo) {
      try {
        const parsed: UsuarioAdmin[] = JSON.parse(salvo);
        if (Array.isArray(parsed)) {
          this.usuarios.set(parsed);
          return;
        }
      } catch {
        // segue para carregar do serviço
      }
    }

    this.painelAdminMockService.obterUsuariosCadastrados().subscribe({
      next: (lista: any[]) => {
        const normalizados: UsuarioAdmin[] = (lista ?? []).map((item, idx) => ({
          id: item?.id ?? `USR-${idx + 1}`,
          nome: item?.nome ?? `Usuário ${idx + 1}`,
          email: item?.email ?? `usuario${idx + 1}@exemplo.com`,
          perfil: item?.perfil === 'Administrador' ? 'Administrador' : 'Usuário',
          ativo: item?.ativo ?? true,
        }));
        this.salvarUsuarios(normalizados);
      },
    });
  }

  alternarSecao(secao: Exclude<SecaoAtiva, null>): void {
    this.feedbackMsg.set(null);
    this.secaoAtiva.set(this.secaoAtiva() === secao ? null : secao);
  }

  cadastrarProduto(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    const novoProduto = this.produtoForm.getRawValue();
    const serviceComCriar = this.produtosService as unknown as {
      criarProduto?: (p: typeof novoProduto) => { subscribe: (cb: (res: any) => void) => void };
    };

    if (typeof serviceComCriar.criarProduto === 'function') {
      serviceComCriar.criarProduto(novoProduto).subscribe((criado) => {
        this.produtosLista.update((lista) => [...lista, criado ?? novoProduto]);
        this.concluirCadastroProduto(novoProduto.nome);
      });
    } else {
      this.produtosLista.update((lista) => [...lista, novoProduto]);
      this.concluirCadastroProduto(novoProduto.nome);
    }
  }

  private concluirCadastroProduto(nome: string): void {
    this.produtoForm.reset({ nome: '', preco: 0, estoque: 1, descricao: '' });
    this.notificar(`Produto "${nome}" cadastrado com sucesso.`);
  }

  adicionarUsuario(novoUsuario?: Partial<UsuarioAdmin>): void {
    if (!novoUsuario) {
      if (this.usuarioForm.invalid) {
        this.usuarioForm.markAllAsTouched();
        return;
      }

      const raw = this.usuarioForm.getRawValue();
      const criado: UsuarioAdmin = {
        id: `USR-${Date.now()}`,
        nome: raw.nome.trim(),
        email: raw.email.trim(),
        perfil: raw.perfil === 'Administrador' ? 'Administrador' : 'Usuário',
        ativo: raw.ativo,
      };

      this.salvarUsuarios([...this.usuarios(), criado]);
      this.usuarioForm.reset({ nome: '', email: '', perfil: 'Usuário', ativo: true });
      this.notificar(`Usuário "${criado.nome}" adicionado com sucesso.`);
      return;
    }

    const usuarioNormalizado: UsuarioAdmin = {
      id: novoUsuario.id ?? `USR-${Date.now()}`,
      nome: (novoUsuario.nome ?? '').trim() || 'Novo Usuário',
      email: (novoUsuario.email ?? '').trim() || `usuario${Date.now()}@exemplo.com`,
      perfil: novoUsuario.perfil === 'Administrador' ? 'Administrador' : 'Usuário',
      ativo: novoUsuario.ativo ?? true,
    };

    this.salvarUsuarios([...this.usuarios(), usuarioNormalizado]);
    this.notificar(`Usuário "${usuarioNormalizado.nome}" adicionado com sucesso.`);
  }

  atualizarStatusPedido(id: string, status: PedidoAdmin['status']): void {
    this.pedidos.update((lista) => lista.map((p) => (p.id === id ? { ...p, status } : p)));
    this.notificar(`Pedido ${id} marcado como "${status}".`);
  }

  alternarStatusUsuario(id: string): void {
    this.salvarUsuarios(this.usuarios().map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)));
    this.notificar('Status do usuário atualizado.');
  }

  alternarPerfilUsuario(id: string): void {
    this.salvarUsuarios(
      this.usuarios().map((u) =>
        u.id === id
          ? { ...u, perfil: u.perfil === 'Administrador' ? 'Usuário' : 'Administrador' }
          : u,
      ),
    );
    this.notificar('Perfil do usuário atualizado.');
  }

  sair(): void {
    this.authFacade.sair();
  }

  private salvarUsuarios(lista: UsuarioAdmin[]): void {
    this.usuarios.set(lista);
    localStorage.setItem(this.STORAGE_KEY_USUARIOS, JSON.stringify(lista));
  }

  private notificar(msg: string): void {
    this.feedbackMsg.set(msg);
  }
}
