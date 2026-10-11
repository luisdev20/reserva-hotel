import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Reserva } from '../../models/models';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding:40px 0;background:var(--cream);min-height:calc(100vh - 140px)">
      <div class="wrap">
        <div style="margin-bottom:28px">
          <h1 style="font-size:28px">Mis Reservas</h1>
          <p style="color:var(--ink-soft);font-size:14px;margin-top:4px">
            Consulta el estado de tus estancias y servicios en Andes Suites.
          </p>
        </div>

        <div *ngIf="mensajeExito" class="alert alert-success">
          <i class="fa-solid fa-check"></i> {{ mensajeExito }}
        </div>
        <div *ngIf="mensajeError" class="alert alert-error">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ mensajeError }}
        </div>

        <div *ngIf="reservas.length === 0" style="background:#fff;border:1px dashed var(--stone);border-radius:8px;padding:48px 24px;text-align:center">
          <i class="fa-solid fa-bed" style="font-size:36px;color:var(--gold);margin-bottom:12px;display:block"></i>
          <h3>Aún no tienes reservas activas</h3>
          <p style="color:var(--ink-soft);font-size:14px;margin:10px auto 20px;max-width:400px">
            Explora nuestras exclusivas suites con vistas a la cordillera y asegura tu próxima experiencia.
          </p>
          <a routerLink="/" class="btn btn-gold btn-sm">Ver Catálogo de Suites</a>
        </div>

        <div *ngIf="reservas.length > 0" class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Suite / Servicio</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservas">
                <td>#{{ r.id }}</td>
                <td><strong>{{ r.servicioNombre }}</strong></td>
                <td>{{ r.fechaEntrada }}</td>
                <td>{{ r.fechaSalida }}</td>
                <td><strong>S/ {{ r.total }}</strong></td>
                <td>
                  <span class="badge" [ngClass]="r.estado === 'CONFIRMADA' ? 'badge-active' : 'badge-inactive'">
                    {{ r.estado }}
                  </span>
                </td>
                <td>
                  <button *ngIf="r.estado !== 'CANCELADA'" (click)="cancelarReserva(r.id!)" class="btn btn-danger btn-sm" style="padding:4px 8px">
                    Cancelar
                  </button>
                  <span *ngIf="r.estado === 'CANCELADA'" style="font-size:12px;color:var(--ink-soft)">Sin acciones</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.getMisReservas().subscribe({
      next: (data) => this.reservas = data,
      error: () => this.mensajeError = 'Error al cargar tus reservas'
    });
  }

  cancelarReserva(id: number): void {
    if (confirm('¿Deseas cancelar esta reserva?')) {
      this.reservaService.cancelarReserva(id).subscribe({
        next: () => {
          this.mensajeExito = 'Reserva cancelada exitosamente';
          this.cargarReservas();
        },
        error: (err) => this.mensajeError = err.error?.error || 'Error al cancelar la reserva'
      });
    }
  }
}
