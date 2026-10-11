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
          </ng-container>
          <ng-container *ngIf="authService.isLoggedIn()">
            <div class="nav-user">
              <i class="fa-regular fa-circle-user" style="color:var(--gold);font-size:16px"></i>
              <span>{{ authService.getCurrentUser()?.nombre }}</span>
              <span *ngIf="authService.isAdmin()" class="role-badge">Admin</span>
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
