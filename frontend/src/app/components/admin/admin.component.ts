import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Categoria, Reserva, Servicio } from '../../models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:40px 0;background:var(--cream);min-height:calc(100vh - 140px)">
      <div class="wrap">
        <!-- HEADER DEL PANEL -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
          <div>
            <h1 style="font-size:28px">Panel Administrativo</h1>
            <p style="color:var(--ink-soft);font-size:14px;margin-top:4px">
              Gestión centralizada de suites, servicios, reservas y usuarios de Andes Suites.
            </p>
          </div>
          <span style="background:var(--gold);color:var(--night-2);font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:1px">
            ROL: ADMIN
          </span>
        </div>

        <!-- KPI CARDS (DEL PANEL DE ANDES SUITES) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:32px">
          <div style="background:#fff;border:1px solid var(--stone);border-radius:6px;padding:20px">
            <span style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px">Suites / Servicios</span>
            <strong style="font-family:var(--serif);font-size:28px;color:var(--night);display:block;margin-top:6px">{{ servicios.length }}</strong>
          </div>
          <div style="background:#fff;border:1px solid var(--stone);border-radius:6px;padding:20px">
            <span style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px">Total Reservas</span>
            <strong style="font-family:var(--serif);font-size:28px;color:var(--night);display:block;margin-top:6px">{{ reservas.length }}</strong>
          </div>
          <div style="background:#fff;border:1px solid var(--stone);border-radius:6px;padding:20px">
            <span style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px">Usuarios Registrados</span>
            <strong style="font-family:var(--serif);font-size:28px;color:var(--night);display:block;margin-top:6px">{{ usuarios.length }}</strong>
          </div>
          <div style="background:#fff;border:1px solid var(--stone);border-radius:6px;padding:20px">
            <span style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.5px">Sobreventas</span>
            <strong style="font-family:var(--serif);font-size:28px;color:var(--gold-2);display:block;margin-top:6px">0%</strong>
          </div>
        </div>

        <!-- PESTAÑAS -->
        <div style="display:flex;gap:12px;border-bottom:1px solid var(--stone);margin-bottom:24px">
          <button (click)="pestana = 'servicios'"
            [style.border-bottom]="pestana === 'servicios' ? '2px solid var(--gold)' : 'none'"
            [style.color]="pestana === 'servicios' ? 'var(--night)' : 'var(--ink-soft)'"
            style="padding:10px 18px;font-weight:600;font-size:14px;background:none">
            <i class="fa-solid fa-bed"></i> Gestión de Servicios (CRUD)
          </button>
          <button (click)="pestana = 'reservas'"
            [style.border-bottom]="pestana === 'reservas' ? '2px solid var(--gold)' : 'none'"
            [style.color]="pestana === 'reservas' ? 'var(--night)' : 'var(--ink-soft)'"
            style="padding:10px 18px;font-weight:600;font-size:14px;background:none">
            <i class="fa-solid fa-calendar-check"></i> Reservas Realizadas
          </button>
          <button (click)="pestana = 'usuarios'"
            [style.border-bottom]="pestana === 'usuarios' ? '2px solid var(--gold)' : 'none'"
            [style.color]="pestana === 'usuarios' ? 'var(--night)' : 'var(--ink-soft)'"
            style="padding:10px 18px;font-weight:600;font-size:14px;background:none">
            <i class="fa-solid fa-users"></i> Usuarios
          </button>
        </div>

        <!-- ALERTAS -->
        <div *ngIf="mensajeExito" class="alert alert-success">
          <i class="fa-solid fa-check"></i> {{ mensajeExito }}
        </div>
        <div *ngIf="mensajeError" class="alert alert-error">
          <i class="fa-solid fa-circle-exclamation"></i> {{ mensajeError }}
        </div>

        <!-- SECCION 1: CRUD DE SERVICIOS -->
        <div *ngIf="pestana === 'servicios'">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <h3>Catálogo de Servicios y Habitaciones</h3>
            <button (click)="abrirModalNuevo()" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-plus"></i> Nuevo Servicio
            </button>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio (S/)</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of servicios">
                  <td>#{{ s.id }}</td>
                  <td><strong>{{ s.nombre }}</strong></td>
                  <td>{{ s.categoriaNombre }}</td>
                  <td>S/ {{ s.precio }}</td>
                  <td>{{ s.capacidad }} pers.</td>
                  <td>
                    <span class="badge" [ngClass]="s.disponible ? 'badge-active' : 'badge-inactive'">
                      {{ s.disponible ? 'Disponible' : 'No disponible' }}
                    </span>
                  </td>
                  <td style="display:flex;gap:8px">
                    <button (click)="abrirModalEditar(s)" class="btn btn-outline-dark btn-sm" style="padding:4px 8px">
                      <i class="fa-solid fa-pen-to-square"></i> Editar
                    </button>
                    <button (click)="eliminarServicio(s.id!)" class="btn btn-danger btn-sm" style="padding:4px 8px">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCION 2: RESERVAS -->
        <div *ngIf="pestana === 'reservas'">
          <h3>Historial General de Reservas</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Huésped</th>
                  <th>Email</th>
                  <th>Servicio / Suite</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of reservas">
                  <td>#{{ r.id }}</td>
                  <td>{{ r.usuarioNombreCompleto }}</td>
                  <td>{{ r.usuarioEmail }}</td>
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCION 3: USUARIOS -->
        <div *ngIf="pestana === 'usuarios'">
          <h3>Usuarios Registrados</h3>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of usuarios">
                  <td>#{{ u.id }}</td>
                  <td>{{ u.nombre }} {{ u.apellido }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.telefono || '—' }}</td>
                  <td>
                    <span class="badge badge-gold">{{ u.rol }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL CREAR / EDITAR SERVICIO -->
    <div *ngIf="modalAbierto" style="position:fixed;inset:0;background:rgba(20,27,36,.65);display:flex;align-items:center;justify-content:center;z-index:99;padding:20px;">
      <div style="background:#fff;border-radius:8px;padding:32px;max-width:520px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.3)">
        <h3 style="margin-bottom:18px">{{ modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>

        <form (ngSubmit)="guardarServicio()">
          <div class="field">
            <label>Nombre del servicio / suite</label>
            <input type="text" [(ngModel)]="servicioForm.nombre" name="nombre" required placeholder="Ej: Suite Panorámica">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="field">
              <label>Categoría</label>
              <select [(ngModel)]="servicioForm.categoriaId" name="categoriaId" required>
                <option *ngFor="let c of categorias" [value]="c.id">{{ c.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Precio por noche (S/)</label>
              <input type="number" [(ngModel)]="servicioForm.precio" name="precio" required min="1" step="0.01">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="field">
              <label>Capacidad (personas)</label>
              <input type="number" [(ngModel)]="servicioForm.capacidad" name="capacidad" required min="1">
            </div>
            <div class="field">
              <label>Disponibilidad</label>
              <select [(ngModel)]="servicioForm.disponible" name="disponible">
                <option [ngValue]="true">Disponible</option>
                <option [ngValue]="false">No disponible</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Descripción</label>
            <textarea [(ngModel)]="servicioForm.descripcion" name="descripcion" placeholder="Detalles de la suite o amenidad..."></textarea>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
            <button type="button" (click)="cerrarModal()" class="btn btn-outline-dark btn-sm">Cancelar</button>
            <button type="submit" class="btn btn-gold btn-sm">Guardar Servicio</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  pestana: 'servicios' | 'reservas' | 'usuarios' = 'servicios';
  servicios: Servicio[] = [];
  reservas: Reserva[] = [];
  usuarios: any[] = [];
  categorias: Categoria[] = [];

  modalAbierto = false;
  modoEdicion = false;
  servicioEditandoId: number | null = null;
  servicioForm: Servicio = {
    nombre: '',
    descripcion: '',
    precio: 200,
    capacidad: 2,
    disponible: true,
    categoriaId: 1
  };

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.reservaService.getServicios(false).subscribe(data => this.servicios = data);
    this.reservaService.getTodasReservas().subscribe(data => this.reservas = data);
    this.authService.listarUsuarios().subscribe(data => this.usuarios = data);
    this.reservaService.getCategorias().subscribe(data => {
      this.categorias = data;
      if (data.length > 0) {
        this.servicioForm.categoriaId = data[0].id;
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.servicioEditandoId = null;
    this.servicioForm = {
      nombre: '',
      descripcion: '',
      precio: 250,
      capacidad: 2,
      disponible: true,
      categoriaId: this.categorias[0]?.id || 1
    };
    this.modalAbierto = true;
  }

  abrirModalEditar(s: Servicio): void {
    this.modoEdicion = true;
    this.servicioEditandoId = s.id!;
    this.servicioForm = {
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: s.precio,
      capacidad: s.capacidad,
      disponible: s.disponible,
      categoriaId: s.categoriaId
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarServicio(): void {
    if (this.modoEdicion && this.servicioEditandoId) {
      this.reservaService.actualizarServicio(this.servicioEditandoId, this.servicioForm).subscribe({
        next: () => {
          this.mensajeExito = 'Servicio actualizado correctamente';
          this.modalAbierto = false;
          this.cargarDatos();
        },
        error: (err) => this.mensajeError = err.error?.error || 'Error al actualizar servicio'
      });
    } else {
      this.reservaService.crearServicio(this.servicioForm).subscribe({
        next: () => {
          this.mensajeExito = 'Servicio creado exitosamente';
          this.modalAbierto = false;
          this.cargarDatos();
        },
        error: (err) => this.mensajeError = err.error?.error || 'Error al crear servicio'
      });
    }
  }

  eliminarServicio(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.reservaService.eliminarServicio(id).subscribe({
        next: () => {
          this.mensajeExito = 'Servicio eliminado correctamente';
          this.cargarDatos();
        },
        error: (err) => this.mensajeError = err.error?.error || 'Error al eliminar servicio'
      });
    }
  }

  cancelarReserva(id: number): void {
    if (confirm('¿Deseas cancelar esta reserva?')) {
      this.reservaService.cancelarReserva(id).subscribe({
        next: () => {
          this.mensajeExito = 'Reserva cancelada correctamente';
          this.cargarDatos();
        },
        error: (err) => this.mensajeError = err.error?.error || 'Error al cancelar reserva'
      });
    }
  }
}
