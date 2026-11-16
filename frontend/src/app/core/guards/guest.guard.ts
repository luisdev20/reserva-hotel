import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Evita que un usuario ya autenticado vuelva a las pantallas de login o registro.
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree([authService.isAdmin() ? '/admin' : '/']);
};
