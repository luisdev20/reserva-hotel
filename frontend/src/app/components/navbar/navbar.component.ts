import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="wrap">
        <a routerLink="/" class="logo">
          <img src="assets/img/logo.svg" alt="Andes Suites">
        </a>
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio / Suites</a>
          <a *ngIf="authService.isLoggedIn() && !authService.isAdmin()" routerLink="/mis-reservas" routerLinkActive="active">Mis Reservas</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active">Panel Admin</a>
        </nav>
        <div class="nav-cta">
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/login" class="btn btn-outline btn-sm">Iniciar sesión</a>
            <a routerLink="/registro" class="btn btn-gold btn-sm">Registrarse</a>
          </ng-container>
          <ng-container *ngIf="authService.isLoggedIn()">
            <div class="nav-user">
              <span>{{ authService.getCurrentUser()?.nombre }}</span>
              <span class="role-badge">{{ authService.getCurrentUser()?.rol }}</span>
            </div>
            <button (click)="logout()" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Salir
            </button>
          </ng-container>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
