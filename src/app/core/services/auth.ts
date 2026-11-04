import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  readonly usuarioAtual$ = this.usuarioSubject.asObservable();

  constructor() {
    this.carregarSessao();
  }

  login(email: string, senha: string): Observable<Usuario> {
    return from(this.supabase.getClient().auth.signInWithPassword({ email, password: senha })).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          throw error ?? new Error('Authentication failed.');
        }
        return from(this.definirUsuario(data.user));
      }),
    );
  }

  loginComGoogle(): Observable<void> {
    return from(
      this.supabase.getClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      }),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  recuperarSenha(email: string): Observable<void> {
    return from(
      this.supabase.getClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/perfil`,
      }),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  registrar(email: string, senha: string, nome: string): Observable<Usuario> {
    return from(
      this.supabase.getClient().auth.signUp({
        email,
        password: senha,
        options: { data: { display_name: nome } },
      }),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          throw error ?? new Error('Registration failed.');
        }
        return from(this.definirUsuario(data.user));
      }),
    );
  }

  logout(): Observable<void> {
    return from(this.supabase.getClient().auth.signOut()).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
        this.usuarioSubject.next(null);
      }),
    );
  }

  atualizarNomeUsuario(nome: string): Observable<void> {
    return from(
      this.supabase.getClient().auth.updateUser({ data: { display_name: nome } }),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          throw error ?? new Error('Profile update failed.');
        }
        return from(this.definirUsuario(data.user)).pipe(map(() => undefined));
      }),
    );
  }

  async obterAccessToken(): Promise<string | null> {
    const { data, error } = await this.supabase.getClient().auth.getSession();
    if (error) {
      throw error;
    }
    return data.session?.access_token ?? null;
  }

  private carregarSessao(): void {
    try {
      const client = this.supabase.getClient();
      from(client.auth.getSession()).subscribe(({ data, error }) => {
        if (error) {
          console.error('Unable to load Supabase session', error);
          return;
        }
        if (data.session?.user) {
          from(this.definirUsuario(data.session.user)).subscribe();
        } else {
          this.usuarioSubject.next(null);
        }
      });
      client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          from(this.definirUsuario(session.user)).subscribe();
        } else {
          this.usuarioSubject.next(null);
        }
      });
    } catch (error) {
      console.error('Supabase authentication is not configured', error);
    }
  }

  private async definirUsuario(user: User): Promise<Usuario> {
    const { data: profile, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: 'customer' | 'admin' }>();
    if (error) {
      throw error;
    }

    const usuario: Usuario = {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata['display_name'] ?? user.user_metadata['full_name'] ?? null,
      role: profile?.role ?? 'customer',
    };
    this.usuarioSubject.next(usuario);
    return usuario;
  }
}
