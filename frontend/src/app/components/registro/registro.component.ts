import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="min-height:calc(100vh - 140px);display:flex;align-items:center;justify-content:center;padding:40px 20px;background:var(--night) url('assets/img/hero-andes.svg') bottom/cover no-repeat;">
      <div style="background:#fff;border-radius:8px;padding:36px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
        <div style="text-align:center;margin-bottom:20px">
          <img src="assets/img/logo.svg" alt="Andes Suites" style="height:40px;margin:0 auto 8px">
          <p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft)">Crear nueva cuenta</p>
        </div>

        <h2 style="font-size:20px;text-align:center;margin-bottom:20px;font-family:var(--serif)">REGISTRO DE CLIENTE</h2>

        <form (ngSubmit)="registrar()">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="field">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="nombre" name="nombre" required placeholder="Carlos">
            </div>
            <div class="field">
              <label>Apellido</label>
              <input type="text" [(ngModel)]="apellido" name="apellido" placeholder="Mendoza">
            </div>
          </div>

          <div class="field">
            <label>Correo Electrónico</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="correo@ejemplo.com">
          </div>

          <div class="field">
            <label>Teléfono</label>
            <input type="tel" [(ngModel)]="telefono" name="telefono" placeholder="987654321">
          </div>

          <div class="field">
            <label>Contraseña (mínimo 6 caracteres)</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" placeholder="******">
          </div>

          <div *ngIf="errorMsg" class="alert alert-error" style="margin-top:10px">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn btn-gold" style="width:100%;margin-top:14px" [disabled]="cargando">
            <i class="fa-solid fa-user-plus"></i> {{ cargando ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
        </form>

        <div style="text-align:center;margin-top:18px;font-size:13px;color:var(--ink-soft)">
          ¿Ya tienes una cuenta? <a routerLink="/login" style="color:var(--gold-2);font-weight:600;text-decoration:underline">Inicia sesión</a>
        </div>
      </div>
    </div>
  `
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  email = '';
  telefono = '';
  password = '';
  cargando = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar(): void {
    if (!this.nombre || !this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    const payload = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      password: this.password,
      rol: 'CLIENTE'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Error al registrar usuario';
      }
    });
  }
}
