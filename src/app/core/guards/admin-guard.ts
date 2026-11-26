import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

const EMAIL_ADMIN = 'admin@email.com';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((usuario) => {
      if (!usuario) {
        return router.createUrlTree(['/login']);
      }
      if (usuario.email?.toLowerCase() === EMAIL_ADMIN.toLowerCase()) {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
  );
};
