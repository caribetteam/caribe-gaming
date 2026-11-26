import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, finalize, throwError } from 'rxjs';
import { AuthFacade } from '../../core/facades/auth.facade';

function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const novaSenha = group.get('novaSenha')?.value;
  const confirmarSenha = group.get('confirmarSenha')?.value;
  if (!novaSenha || !confirmarSenha) {
    return null;
  }
  return novaSenha === confirmarSenha ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  authFacade = inject(AuthFacade);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  perfilForm: FormGroup;
  senhaForm: FormGroup;

  mensagemSucesso = signal('');
  mensagemErro = signal('');

  salvandoNome = signal(false);
  salvandoSenha = signal(false);
  excluindoConta = signal(false);
  confirmandoExclusao = signal(false);

  constructor() {
    this.perfilForm = this.fb.group({
      nomeUsuario: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.senhaForm = this.fb.group(
      {
        novaSenha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', [Validators.required]],
      },
      { validators: senhasIguaisValidator },
    );

    effect(() => {
      const usuario = this.authFacade.usuarioAtual();
      if (usuario && !this.perfilForm.dirty) {
        this.perfilForm.patchValue({
          nomeUsuario: usuario.displayName || '',
        });
      }
    });
  }

  private limparAvisos(): void {
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');
  }

  salvar(): void {
    if (this.salvandoNome()) {
      return;
    }

    this.limparAvisos();

    const nomeLimpo = String(this.perfilForm.get('nomeUsuario')?.value ?? '').trim();
    this.perfilForm.patchValue({ nomeUsuario: nomeLimpo }, { emitEvent: false });

    if (this.perfilForm.invalid || nomeLimpo.length < 3) {
      this.perfilForm.markAllAsTouched();
      this.mensagemErro.set('O nome de usuário precisa ter no mínimo 3 caracteres.');
      return;
    }

    this.salvandoNome.set(true);

    this.authFacade
      .atualizarNomeUsuario(nomeLimpo)
      .pipe(finalize(() => this.salvandoNome.set(false)))
      .subscribe({
        next: () => {
          this.perfilForm.markAsPristine();
          this.mensagemSucesso.set('Nome de usuário atualizado com sucesso!');
        },
        error: (erro) => {
          console.error('Erro ao atualizar nome:', erro);
          this.mensagemErro.set('Não foi possível salvar o nome. Tente novamente.');
        },
      });
  }

  alterarSenha(): void {
    if (this.salvandoSenha()) {
      return;
    }

    this.limparAvisos();

    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      if (this.senhaForm.hasError('senhasDiferentes')) {
        this.mensagemErro.set('A confirmação da senha não confere.');
      } else {
        this.mensagemErro.set('A nova senha deve ter no mínimo 6 caracteres.');
      }
      return;
    }

    const { novaSenha } = this.senhaForm.getRawValue();
    const facadeEstendido = this.authFacade as unknown as {
      alterarSenha?: (senha: string) => Observable<unknown>;
    };

    if (typeof facadeEstendido.alterarSenha !== 'function') {
      this.mensagemErro.set('Método alterarSenha ainda não implementado no AuthFacade.');
      return;
    }

    this.salvandoSenha.set(true);

    facadeEstendido
      .alterarSenha(novaSenha)
      .pipe(finalize(() => this.salvandoSenha.set(false)))
      .subscribe({
        next: () => {
          this.senhaForm.reset();
          this.mensagemSucesso.set('Senha alterada com sucesso!');
        },
        error: (erro) => {
          console.error('Erro ao alterar senha:', erro);
          this.mensagemErro.set(
            'Não foi possível alterar a senha. Pode ser necessário fazer login novamente.',
          );
        },
      });
  }

  solicitarConfirmacaoExclusao(): void {
    this.limparAvisos();
    this.confirmandoExclusao.set(true);
  }

  cancelarExclusao(): void {
    this.confirmandoExclusao.set(false);
  }

  apagarConta(): void {
    if (this.excluindoConta()) {
      return;
    }

    this.limparAvisos();

    const facadeEstendido = this.authFacade as unknown as {
      excluirConta?: () => Observable<unknown>;
    };

    const acao$: Observable<unknown> =
      typeof facadeEstendido.excluirConta === 'function'
        ? facadeEstendido.excluirConta()
        : throwError(() => new Error('Método excluirConta ainda não implementado no AuthFacade.'));

    this.excluindoConta.set(true);

    acao$.pipe(finalize(() => this.excluindoConta.set(false))).subscribe({
      next: () => {
        this.confirmandoExclusao.set(false);
        this.router.navigate(['/']);
      },
      error: (erro) => {
        console.error('Erro ao apagar conta:', erro);
        this.mensagemErro.set(erro?.message || 'Não foi possível apagar a conta. Tente novamente.');
      },
    });
  }
}
