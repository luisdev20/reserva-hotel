import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Convierte cualquier error HTTP en un Error con un mensaje en español.
// Los componentes solo necesitan mostrar err.message.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensaje = 'Ocurrió un error inesperado. Intenta nuevamente.';

      if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
      } else if (error.status === 401) {
        mensaje = error.error?.error ?? 'Tu sesión expiró. Inicia sesión nuevamente.';

        // Solo cerramos la sesión si el token existía y el error no viene del login.
        if (authService.isLoggedIn() && !req.url.includes('/auth/login')) {
          authService.logout();
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
      } else if (error.status === 403) {
        mensaje = error.error?.error ?? 'No tienes permisos para realizar esta acción.';
      } else if (error.status === 404) {
        mensaje = error.error?.error ?? 'El recurso solicitado no existe.';
      } else if (error.error?.error) {
        mensaje = error.error.error;
      } else if (error.error?.message) {
        mensaje = error.error.message;
      }

      return throwError(() => new Error(mensaje));
    })
  );
};
