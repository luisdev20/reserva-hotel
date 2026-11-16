import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, Reserva, Servicio, Usuario } from '../../core/models/models';

type Pestana = 'servicios' | 'reservas' | 'usuarios';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly pestana = signal<Pestana>('servicios');
  readonly servicios = signal<Servicio[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly categorias = signal<Categoria[]>([]);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly modalAbierto = signal(false);
  readonly modoEdicion = signal(false);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  private servicioEditandoId: number | null = null;

  readonly totalServicios = computed(() => this.servicios().length);
  readonly totalReservas = computed(() => this.reservas().length);
  readonly reservasActivas = computed(
    () => this.reservas().filter((reserva) => reserva.estado === 'CONFIRMADA').length
  );
  readonly totalUsuarios = computed(() => this.usuarios().length);

  readonly servicioForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
    categoriaId: [1, [Validators.required, Validators.min(1)]],
    precio: [250, [Validators.required, Validators.min(1)]],
    capacidad: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
    disponible: [true],
    imagenUrl: ['']
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  get nombre() {
    return this.servicioForm.controls.nombre;
  }

  get descripcion() {
    return this.servicioForm.controls.descripcion;
  }

  get categoriaId() {
    return this.servicioForm.controls.categoriaId;
  }

  get precio() {
    return this.servicioForm.controls.precio;
  }

  get capacidad() {
    return this.servicioForm.controls.capacidad;
  }

  get imagenUrl() {
    return this.servicioForm.controls.imagenUrl;
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    // forkJoin ejecuta las cuatro peticiones en paralelo y espera la última.
    forkJoin({
      servicios: this.reservaService.getServicios(),
      reservas: this.reservaService.getTodasReservas(),
      usuarios: this.authService.listarUsuarios(),
      categorias: this.reservaService.getCategorias()
    }).subscribe({
      next: ({ servicios, reservas, usuarios, categorias }) => {
        this.servicios.set(servicios);
        this.reservas.set(reservas);
        this.usuarios.set(usuarios);
        this.categorias.set(categorias);

        if (categorias.length > 0) {
          this.servicioForm.controls.categoriaId.setValue(categorias[0].id);
        }
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion.set(false);
    this.servicioEditandoId = null;
    this.errorModal.set('');
    this.servicioForm.reset({
      nombre: '',
      descripcion: '',
      categoriaId: this.categorias()[0]?.id ?? 1,
      precio: 250,
      capacidad: 2,
      disponible: true,
      imagenUrl: ''
    });
    this.modalAbierto.set(true);
  }

  abrirModalEditar(servicio: Servicio): void {
    this.modoEdicion.set(true);
    this.servicioEditandoId = servicio.id ?? null;
    this.errorModal.set('');
    this.servicioForm.reset({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      categoriaId: servicio.categoriaId,
      precio: servicio.precio,
      capacidad: servicio.capacidad,
      disponible: servicio.disponible,
      imagenUrl: servicio.imagenUrl ?? ''
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.errorModal.set('');
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const valores = this.servicioForm.getRawValue();
    const servicio: Servicio = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoriaId: valores.categoriaId,
      precio: valores.precio,
      capacidad: valores.capacidad,
      disponible: valores.disponible,
      imagenUrl: valores.imagenUrl.trim() || undefined
    };

    this.guardando.set(true);
    const peticion = this.modoEdicion() && this.servicioEditandoId
      ? this.reservaService.actualizarServicio(this.servicioEditandoId, servicio)
      : this.reservaService.crearServicio(servicio);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.exito(
          this.modoEdicion() ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente'
        );
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: Error) => {
        this.guardando.set(false);
        this.errorModal.set(error.message);
      }
    });
  }

  eliminarServicio(id: number): void {
    if (!confirm('¿Deseas eliminar este servicio del catálogo?')) {
      return;
    }

    this.reservaService.eliminarServicio(id).subscribe({
      next: (respuesta) => {
        this.toastService.exito(respuesta.mensaje);
        this.cargarDatos();
      },
      error: (error: Error) => this.toastService.error(error.message)
    });
  }

  cancelarReserva(id: number): void {
    if (!confirm('¿Deseas cancelar esta reserva?')) {
      return;
    }

    this.reservaService.cancelarReserva(id).subscribe({
      next: () => {
        this.toastService.exito('Reserva cancelada correctamente');
        this.cargarDatos();
      },
      error: (error: Error) => this.toastService.error(error.message)
    });
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) {
      return '—';
    }

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }
}
