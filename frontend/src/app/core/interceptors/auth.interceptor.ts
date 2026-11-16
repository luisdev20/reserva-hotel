import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Agrega el token JWT a todas las peticiones protegidas.
// Así los componentes y servicios no repiten la cabecera Authorization.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const esRutaPublica = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (!token || esRutaPublica) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
