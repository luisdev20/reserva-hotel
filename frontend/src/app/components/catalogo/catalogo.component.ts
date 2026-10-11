import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Servicio } from '../../models/models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- HERO SECTION -->
    <section class="hero">
      <div class="wrap">
        <p class="hero-eyebrow">HOTEL ANDES SUITES</p>
        <h1>Dormir a la altura de la cordillera.</h1>
        <p class="lead">
          Suites diseñadas para el descanso, con vista a los Andes y un sistema de reservas que garantiza que tu habitación siempre te esté esperando: sin sobreventas, sin sorpresas.
        </p>
        <div class="hero-actions">
          <a href="#catalogo-seccion" class="btn btn-gold">Explorar Suites</a>
          <button *ngIf="!authService.isLoggedIn()" (click)="irALogin()" class="btn btn-outline">Acceder al Sistema</button>
        </div>
        <div class="hero-stats">
          <div><strong>4</strong><span>Sedes en la cordillera</span></div>
          <div><strong>0%</strong><span>Errores de sobreventa</span></div>
          <div><strong>24/7</strong><span>Confirmación en línea</span></div>
        </div>
      </div>
    </section>

    <!-- CATALOGO DE SERVICIOS / SUITES -->
    <section id="catalogo-seccion">
      <div class="wrap">
        <div class="section-head center">
          <span class="eyebrow-line"></span>
          <h2>Nuestras suites y servicios</h2>
          <p style="margin:14px auto 0;color:var(--ink-soft)">
            Tres categorías, un mismo estándar de confort. Elige según tu vista, tu espacio y tu ocasión.
          </p>
        </div>

        <!-- FILTROS (USA LA CONSULTA JPQL DE SPRING BOOT) -->
        <div style="background:#fff;padding:20px 24px;border-radius:var(--radius);border:1px solid var(--stone);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:32px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <label style="font-weight:600;font-size:13px;color:var(--ink-soft);">FILTRAR POR PRECIO MÁXIMO (JPQL):</label>
            <input type="number" [(ngModel)]="filtroPrecio" placeholder="Ej. 500" style="width:140px;padding:8px 12px;border:1px solid var(--stone);border-radius:4px;">
            <button (click)="filtrarPorPrecio()" class="btn btn-gold btn-sm">Filtrar</button>
            <button *ngIf="filtroAplicado" (click)="limpiarFiltro()" class="btn btn-outline-dark btn-sm">Ver todos</button>
          </div>
          <span style="font-size:13px;color:var(--ink-soft)">
            Mostrando <strong>{{ servicios.length }}</strong> opciones
          </span>
        </div>

        <!-- MENSAJE DE CONFIRMACION O ERROR -->
        <div *ngIf="mensajeExito" class="alert alert-success">
          <i class="fa-solid fa-check-circle"></i> {{ mensajeExito }}
        </div>
        <div *ngIf="mensajeError" class="alert alert-error">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ mensajeError }}
        </div>

        <!-- CARDS DE SUITES / SERVICIOS -->
        <div class="suites-grid">
          <div *ngFor="let s of servicios" class="suite-card">
            <span class="tag">{{ s.categoriaNombre || 'HOSPEDAJE' }}</span>
            <h3>{{ s.nombre }}</h3>
            <p>{{ s.descripcion }}</p>
            <div style="font-size:12.5px;color:var(--ink-soft);margin-bottom:14px;">
              <i class="fa-solid fa-user-group" style="color:var(--gold);margin-right:6px"></i> Capacidad: {{ s.capacidad }} personas
            </div>
            <div class="card-footer">
              <div class="price">
                S/ {{ s.precio }} <span>/ noche</span>
              </div>
              <button (click)="abrirModalReserva(s)" class="btn btn-gold btn-sm">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL DE RESERVA -->
    <div *ngIf="servicioSeleccionado" style="position:fixed;inset:0;background:rgba(20,27,36,.65);display:flex;align-items:center;justify-content:center;z-index:99;padding:20px;">
      <div style="background:#fff;border-radius:8px;padding:32px;max-width:480px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.3)">
        <h3 style="margin-bottom:8px">Reservar {{ servicioSeleccionado.nombre }}</h3>
        <p style="font-size:13px;color:var(--ink-soft);margin-bottom:20px">
          Tarifa: <strong>S/ {{ servicioSeleccionado.precio }} / noche</strong>
        </p>

        <form (ngSubmit)="confirmarReserva()">
          <div class="field">
            <label>Fecha de Entrada</label>
            <input type="date" [(ngModel)]="fechaEntrada" name="fechaEntrada" required>
          </div>
          <div class="field">
            <label>Fecha de Salida</label>
            <input type="date" [(ngModel)]="fechaSalida" name="fechaSalida" required>
          </div>
          <div class="field">
            <label>Notas especiales (opcional)</label>
            <textarea [(ngModel)]="notas" name="notas" placeholder="Ej: Habitación en piso alto, check-in anticipado..."></textarea>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
            <button type="button" (click)="cerrarModal()" class="btn btn-outline-dark btn-sm">Cancelar</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="cargandoReserva">
              {{ cargandoReserva ? 'Confirmando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CatalogoComponent implements OnInit {
  servicios: Servicio[] = [];
  filtroPrecio?: number;
  filtroAplicado = false;
  servicioSeleccionado: Servicio | null = null;
  fechaEntrada = '';
  fechaSalida = '';
  notas = '';
  mensajeExito = '';
  mensajeError = '';
  cargandoReserva = false;

  constructor(
    private reservaService: ReservaService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.reservaService.getServicios(true).subscribe({
      next: (data) => {
        this.servicios = data;
        this.filtroAplicado = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo conectar con el backend de Spring Boot.';
      }
    });
  }

  filtrarPorPrecio(): void {
    if (!this.filtroPrecio || this.filtroPrecio <= 0) {
      this.cargarServicios();
      return;
    }
    this.reservaService.buscarPorPrecioMax(this.filtroPrecio).subscribe({
      next: (data) => {
        this.servicios = data;
        this.filtroAplicado = true;
      },
      error: () => {
        this.mensajeError = 'Error al ejecutar la consulta de filtro JPQL.';
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroPrecio = undefined;
    this.cargarServicios();
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  abrirModalReserva(servicio: Servicio): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.servicioSeleccionado = servicio;
    this.mensajeExito = '';
    this.mensajeError = '';
    // Fechas por defecto (hoy + 1 día hasta hoy + 3 días)
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const salida = new Date(hoy);
    salida.setDate(hoy.getDate() + 3);

    this.fechaEntrada = manana.toISOString().split('T')[0];
    this.fechaSalida = salida.toISOString().split('T')[0];
    this.notas = '';
  }

  cerrarModal(): void {
    this.servicioSeleccionado = null;
  }

  confirmarReserva(): void {
    if (!this.servicioSeleccionado?.id) return;
    this.cargandoReserva = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const payload = {
      servicioId: this.servicioSeleccionado.id,
      fechaEntrada: this.fechaEntrada,
      fechaSalida: this.fechaSalida,
      notas: this.notas
    };

    this.reservaService.crearReserva(payload).subscribe({
      next: (res) => {
        this.cargandoReserva = false;
        this.servicioSeleccionado = null;
        this.mensajeExito = `¡Reserva #${res.id} confirmada exitosamente por un total de S/ ${res.total}!`;
      },
      error: (err) => {
        this.cargandoReserva = false;
        this.mensajeError = err.error?.error || 'No se pudo crear la reserva. Verifica las fechas.';
      }
    });
  }
}
