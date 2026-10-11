import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="min-height:calc(100vh - 140px);display:flex;align-items:center;justify-content:center;padding:40px 20px;background:var(--night) url('assets/img/hero-andes.svg') bottom/cover no-repeat;">
      <div style="background:#fff;border-radius:8px;padding:36px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
        <div style="text-align:center;margin-bottom:24px">
          <img src="assets/img/logo.svg" alt="Andes Suites" style="height:44px;margin:0 auto 10px">
          <p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft)">Sistema de reservas</p>
        </div>

        <h2 style="font-size:20px;text-align:center;margin-bottom:20px;font-family:var(--serif)">INICIAR SESIÓN</h2>

        <!-- SELECTOR DE ROL DE PRUEBA -->
        <div style="display:flex;gap:8px;margin-bottom:22px">
          <button type="button" (click)="cargarCredenciales('CLIENTE')"
            [style.background]="rolSeleccionado === 'CLIENTE' ? 'var(--night)' : '#FBF9F4'"
            [style.color]="rolSeleccionado === 'CLIENTE' ? 'var(--gold)' : 'var(--ink-soft)'"
            style="flex:1;padding:10px 6px;border:1px solid var(--stone);border-radius:6px;font-size:12px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:4px">
            <i class="fa-solid fa-user"></i> Huésped
          </button>
          <button type="button" (click)="cargarCredenciales('ADMIN')"
            [style.background]="rolSeleccionado === 'ADMIN' ? 'var(--night)' : '#FBF9F4'"
            [style.color]="rolSeleccionado === 'ADMIN' ? 'var(--gold)' : 'var(--ink-soft)'"
            style="flex:1;padding:10px 6px;border:1px solid var(--stone);border-radius:6px;font-size:12px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:4px">
            <i class="fa-solid fa-crown"></i> Admin
          </button>
        </div>

        <!-- FORMULARIO -->
        <form (ngSubmit)="iniciarSesion()">
          <div class="field">
            <label>Correo Electrónico</label>
            <div style="position:relative">
              <i class="fa-solid fa-at" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--gold-2)"></i>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="correo@ejemplo.com" style="padding-left:38px">
            </div>
          </div>

          <div class="field">
            <label>Contraseña</label>
            <div style="position:relative">
              <i class="fa-solid fa-lock" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--gold-2)"></i>
              <input type="password" [(ngModel)]="password" name="password" required placeholder="Tu contraseña" style="padding-left:38px">
            </div>
          </div>

          <div *ngIf="errorMsg" class="alert alert-error" style="margin-top:12px">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn btn-gold" style="width:100%;margin-top:14px" [disabled]="cargando">
            <i class="fa-solid fa-right-to-bracket"></i> {{ cargando ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <div style="text-align:center;margin-top:20px;font-size:13px;color:var(--ink-soft)">
          ¿No tienes cuenta? <a routerLink="/registro" style="color:var(--gold-2);font-weight:600;text-decoration:underline">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = 'cliente@andessuites.com';
  password = 'cliente123';
  rolSeleccionado: 'CLIENTE' | 'ADMIN' = 'CLIENTE';
  cargando = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  cargarCredenciales(rol: 'CLIENTE' | 'ADMIN'): void {
    this.rolSeleccionado = rol;
    if (rol === 'ADMIN') {
      this.email = 'admin@andessuites.com';
      this.password = 'admin123';
    } else {
      this.email = 'cliente@andessuites.com';
      this.password = 'cliente123';
    }
  }

  iniciarSesion(): void {
    this.cargando = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Credenciales incorrectas';
      }
    });
  }
}
