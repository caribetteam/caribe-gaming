import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth';

const EMAIL_ADMIN = 'admin@email.com';
const STORAGE_KEY_USUARIOS = 'admin_usuarios_cadastrados';

interface UsuarioRegistradoStorage {
  id: string;
  nome: string;
  email: string;
  perfil: 'Administrador' | 'Usuário';
  ativo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private authService = inject(AuthService);

  readonly usuarioAtual$ = this.authService.usuarioAtual$;
  usuarioAtual = toSignal(this.usuarioAtual$, { initialValue: null });

  estaLogado(): boolean {
    return !!this.usuarioAtual();
  }

  ehAdmin = computed(() => this.usuarioAtual()?.email?.toLowerCase() === EMAIL_ADMIN.toLowerCase());

  nomeExibicao = computed(() => {
    const usuario = this.usuarioAtual();
    return usuario?.displayName || usuario?.email || '';
  });

  realizarLogin(email: string, senha: string) {
    return this.authService.login(email, senha).pipe(
      tap((res: any) => {
        const emailUsuario = res?.user?.email || res?.email || email;
        const nomeUsuario =
          res?.user?.displayName || res?.displayName || emailUsuario?.split('@')?.[0] || 'Usuário';
        this.registrarUsuarioNoStorage(emailUsuario, nomeUsuario);
      }),
    );
  }

  realizarRegistro(email: string, senha: string, nome: string) {
    return this.authService.registrar(email, senha, nome).pipe(
      tap((res: any) => {
        const emailUsuario = res?.user?.email || res?.email || email;
        const nomeUsuario = nome?.trim() || res?.user?.displayName || emailUsuario?.split('@')?.[0];
        this.registrarUsuarioNoStorage(emailUsuario, nomeUsuario);
      }),
    );
  }

  atualizarNomeUsuario(nome: string) {
    return this.authService.atualizarNomeUsuario(nome).pipe(
      tap(() => {
        const atual = this.usuarioAtual();
        if (atual?.email) {
          this.atualizarNomeNoStorage(atual.email, nome);
        }
      }),
    );
  }

  sair() {
    this.authService.logout().subscribe();
  }

  private registrarUsuarioNoStorage(email?: string, nome?: string): void {
    const emailLimpo = email?.trim();
    if (!emailLimpo) {
      return;
    }

    const lista = this.lerUsuariosStorage();
    const jaExiste = lista.some((u) => u.email.toLowerCase() === emailLimpo.toLowerCase());

    if (!jaExiste) {
      const novo: UsuarioRegistradoStorage = {
        id: `USR-${Date.now()}`,
        nome: nome?.trim() || emailLimpo.split('@')[0],
        email: emailLimpo,
        perfil:
          emailLimpo.toLowerCase() === EMAIL_ADMIN.toLowerCase() ? 'Administrador' : 'Usuário',
        ativo: true,
      };
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify([...lista, novo]));
    }
  }

  private atualizarNomeNoStorage(email: string, novoNome: string): void {
    const nomeLimpo = novoNome.trim();
    if (!nomeLimpo) {
      return;
    }

    const lista = this.lerUsuariosStorage();
    const atualizada = lista.map((u) =>
      u.email.toLowerCase() === email.toLowerCase() ? { ...u, nome: nomeLimpo } : u,
    );
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(atualizada));
  }

  private lerUsuariosStorage(): UsuarioRegistradoStorage[] {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY_USUARIOS);
      if (!bruto) {
        return [];
      }
      const parsed = JSON.parse(bruto);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
