import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

// Rutas con carga diferida (lazy loading).
// Cada módulo funcional se descarga solo cuando el usuario navega a él.
export const routes: Routes = [
  {
    path: '',
    title: 'Andes Suites | Catálogo de suites',
    loadComponent: () => import('./features/catalogo/catalogo.component').then((m) => m.CatalogoComponent)
  },
  {
    path: 'nosotros',
    title: 'Nuestra historia | Andes Suites',
    loadComponent: () => import('./features/nosotros/nosotros.component').then((m) => m.NosotrosComponent)
  },
  {
    path: 'login',
    title: 'Iniciar sesión | Andes Suites',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'registro',
    title: 'Crear cuenta | Andes Suites',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/registro/registro.component').then((m) => m.RegistroComponent)
  },
  {
    path: 'mis-reservas',
    title: 'Mis reservas | Andes Suites',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservas/mis-reservas.component').then((m) => m.MisReservasComponent)
  },
  {
    path: 'admin',
    title: 'Panel administrativo | Andes Suites',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent)
  },
  {
    path: 'no-encontrado',
    title: 'Página no encontrada | Andes Suites',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
  { path: '**', redirectTo: 'no-encontrado' }
];
