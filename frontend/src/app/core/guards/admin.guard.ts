import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege el panel administrativo: exige sesión y rol ADMIN.
export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.isAdmin()) {
    return true;
  }

  // Un cliente autenticado no puede entrar al panel de administración.
  return router.createUrlTree(['/']);
};
