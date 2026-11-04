import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth';

export const backendAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(`${environment.backendUrl}/api/`)) {
    return next(request);
  }

  const authService = inject(AuthService);

  return from(authService.obterAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(request);
      }

      return next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    }),
  );
};