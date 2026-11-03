import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.usuarioAtual$.pipe(
    take(1),
    map((usuario) => {
      if (usuario) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};