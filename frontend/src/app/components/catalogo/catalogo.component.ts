import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    <section class="hero" style="padding: 70px 0 60px">
      <div class="wrap">
        <p class="hero-eyebrow">HOTEL ANDES SUITES</p>
        <h1 style="font-size: clamp(32px, 4.2vw, 52px); max-width: 18ch">Dormir a la altura de la cordillera.</h1>
        <p class="lead" style="margin-top: 14px; font-size: 16px; max-width: 50ch">
          Suites diseñadas para el descanso, con vista a los Andes y un sistema de reservas que garantiza disponibilidad en tiempo real: sin sobreventas, sin sorpresas.
        </p>
        <div class="hero-actions" style="margin-top: 26px">
          <button (click)="scrollACatalogo()" class="btn btn-gold">
            Explorar suites <i class="fa-solid fa-arrow-down" style="font-size:12px;margin-left:4px"></i>
          </button>
        </div>
        <div class="hero-stats" style="margin-top: 36px; padding-top: 20px; gap: 40px">
          <div><strong>4</strong><span>Sedes en la cordillera</span></div>
          <div><strong>0%</strong><span>Errores de sobreventa</span></div>
          <div><strong>24/7</strong><span>Confirmación en línea</span></div>
        </div>
      </div>
    </section>

    <!-- CATALOGO DE SERVICIOS / SUITES -->
    <section id="catalogo-seccion" style="padding: 50px 0 70px">
      <div class="wrap">
        <div class="section-head center" style="margin-bottom: 30px">
          <span class="eyebrow-line"></span>
          <h2>Nuestras suites y servicios</h2>
          <p style="margin:10px auto 0;color:var(--ink-soft)">
            Tres categorías, un mismo estándar de confort. Elige según tu vista, tu espacio y tu ocasión.
          </p>
        </div>

        <!-- FILTROS POR PRECIO -->
        <div style="background:#fff;padding:18px 24px;border-radius:var(--radius);border:1px solid var(--stone);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <label style="font-weight:600;font-size:13px;color:var(--ink-soft);display:flex;align-items:center;gap:6px">
              <i class="fa-solid fa-sliders" style="color:var(--gold)"></i> Filtrar por precio máximo por noche:
            </label>
            <input type="number" [(ngModel)]="filtroPrecio" (keydown)="bloquearNegativos($event)" (input)="validarPrecioPositivo()" min="0" step="50" placeholder="Ej. 500" style="width:130px;padding:8px 12px;border:1px solid var(--stone);border-radius:4px;">
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

        <!-- INDICADOR DE CARGA INICIAL -->
        <div *ngIf="cargandoServicios" style="text-align:center;padding:50px 0;color:var(--ink-soft)">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size:32px;color:var(--gold);margin-bottom:12px;display:block"></i>
          <p style="font-size:14px">Cargando suites disponibles...</p>
        </div>

        <!-- MENSAJE CUANDO NO HAY OPCIONES CON ESE PRECIO (SOLO TRAS FILTRAR) -->
        <div *ngIf="!cargandoServicios && servicios.length === 0" style="background:#fff;border:1px dashed var(--stone);border-radius:var(--radius);padding:44px 24px;text-align:center;margin-top:16px">
          <i class="fa-solid fa-magnifying-glass" style="font-size:30px;color:var(--gold);margin-bottom:10px;display:block"></i>
          <h3 style="font-size:18px">No se encontraron suites con ese precio</h3>
          <p style="color:var(--ink-soft);font-size:14px;margin:8px auto 18px;max-width:420px">
            No existen opciones con una tarifa igual o menor al monto indicado. Puedes probar con un valor mayor.
          </p>
          <button (click)="limpiarFiltro()" class="btn btn-gold btn-sm">Ver todas las suites</button>
        </div>

        <!-- CARDS DE SUITES / SERVICIOS (VISIBLES INMEDIATAMENTE AL CARGAR) -->
        <div class="suites-grid" *ngIf="!cargandoServicios && servicios.length > 0">
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
  cargandoServicios = true;

  constructor(
    private reservaService: ReservaService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  scrollACatalogo(): void {
    const el = document.getElementById('catalogo-seccion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    this.cdr.detectChanges();
    this.reservaService.getServicios(false).subscribe({
      next: (data) => {
        this.servicios = data;
        this.filtroAplicado = false;
        this.cargandoServicios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoServicios = false;
        this.mensajeError = 'No se pudo conectar con el backend de Spring Boot.';
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorPrecio(): void {
    if (!this.filtroPrecio || this.filtroPrecio <= 0) {
      this.cargarServicios();
      return;
    }
    this.cargandoServicios = true;
    this.cdr.detectChanges();
    this.reservaService.buscarPorPrecioMax(this.filtroPrecio).subscribe({
      next: (data) => {
        this.servicios = data;
        this.filtroAplicado = true;
        this.cargandoServicios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoServicios = false;
        this.mensajeError = 'Error al ejecutar la consulta de filtro.';
        this.cdr.detectChanges();
      }
    });
  }

  bloquearNegativos(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  validarPrecioPositivo(): void {
    if (this.filtroPrecio !== undefined && this.filtroPrecio !== null && this.filtroPrecio < 0) {
      this.filtroPrecio = 0;
    }
    if ((this.filtroPrecio === null || this.filtroPrecio === undefined || (this.filtroPrecio as any) === '') && this.filtroAplicado) {
      this.limpiarFiltro();
    }
  }

  limpiarFiltro(): void {
    this.filtroPrecio = undefined;
    this.cargarServicios();
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
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.servicioSeleccionado = null;
    this.cdr.detectChanges();
  }

  confirmarReserva(): void {
    if (!this.servicioSeleccionado?.id) return;
    this.cargandoReserva = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoReserva = false;
        this.mensajeError = err.error?.error || 'No se pudo crear la reserva. Verifica las fechas.';
        this.cdr.detectChanges();
      }
    });
  }
}
