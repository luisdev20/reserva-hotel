import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Servicio } from '../../core/models/models';
import { fechaLocalISO, rangoFechasValidator } from '../../core/validators/date-range.validator';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly servicios = signal<Servicio[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly filtroAplicado = signal(false);

  readonly servicioSeleccionado = signal<Servicio | null>(null);
  readonly cargandoReserva = signal(false);
  readonly errorReserva = signal('');
  readonly enviadoReserva = signal(false);
  readonly noches = signal(0);
  readonly totalEstimado = signal(0);
  readonly minSalida = signal('');
  readonly hoyISO = fechaLocalISO(new Date());

  // Filtro por precio máximo (consume la consulta JPQL del backend).
  readonly filtroForm = this.fb.group({
    precioMax: [null as number | null, [Validators.min(1)]]
  });

  // Formulario reactivo de reserva con validación de rango de fechas.
  readonly reservaForm = this.fb.nonNullable.group(
    {
      fechaEntrada: ['', [Validators.required]],
      fechaSalida: ['', [Validators.required]],
      notas: ['', [Validators.maxLength(250)]]
    },
    { validators: rangoFechasValidator }
  );

  constructor() {
    this.reservaForm.valueChanges.subscribe(() => this.actualizarResumen());
  }

  ngOnInit(): void {
    this.cargarServicios();
  }

  get fechaEntrada() {
    return this.reservaForm.controls.fechaEntrada;
  }

  get fechaSalida() {
    return this.reservaForm.controls.fechaSalida;
  }

  get notas() {
    return this.reservaForm.controls.notas;
  }

  scrollACatalogo(): void {
    document.getElementById('catalogo-seccion')?.scrollIntoView({ behavior: 'smooth' });
  }

  cargarServicios(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.reservaService.getServicios().subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.filtroAplicado.set(false);
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  filtrarPorPrecio(): void {
    const precioMax = this.filtroForm.controls.precioMax;

    if (precioMax.invalid) {
      precioMax.markAsTouched();
      return;
    }

    if (!precioMax.value || precioMax.value <= 0) {
      this.cargarServicios();
      return;
    }

    this.cargando.set(true);
    this.errorCarga.set('');

    this.reservaService.buscarPorPrecioMax(precioMax.value).subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.filtroAplicado.set(true);
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroForm.reset({ precioMax: null });
    this.cargarServicios();
  }

  abrirModalReserva(servicio: Servicio): void {
    if (!servicio.disponible) {
      this.toastService.info('Esta suite no está disponible por el momento.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    const hoy = new Date();
    const entrada = new Date(hoy);
    entrada.setDate(hoy.getDate() + 1);
    const salida = new Date(hoy);
    salida.setDate(hoy.getDate() + 3);

    this.servicioSeleccionado.set(servicio);
    this.errorReserva.set('');
    this.enviadoReserva.set(false);
    this.reservaForm.reset({
      fechaEntrada: fechaLocalISO(entrada),
      fechaSalida: fechaLocalISO(salida),
      notas: ''
    });
    this.actualizarResumen();
  }

  cerrarModal(): void {
    this.servicioSeleccionado.set(null);
    this.errorReserva.set('');
  }

  confirmarReserva(): void {
    this.enviadoReserva.set(true);
    this.errorReserva.set('');

    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const servicio = this.servicioSeleccionado();
    if (!servicio?.id) {
      return;
    }

    const valores = this.reservaForm.getRawValue();
    this.cargandoReserva.set(true);

    this.reservaService.crearReserva({
      servicioId: servicio.id,
      fechaEntrada: valores.fechaEntrada,
      fechaSalida: valores.fechaSalida,
      notas: valores.notas.trim() || undefined
    }).subscribe({
      next: (reserva) => {
        this.cargandoReserva.set(false);
        this.toastService.exito(
          `Reserva #${reserva.id} confirmada. Total: S/ ${reserva.total}`
        );
        this.cerrarModal();
      },
      error: (error: Error) => {
        this.cargandoReserva.set(false);
        this.errorReserva.set(error.message);
      }
    });
  }

  private actualizarResumen(): void {
    const { fechaEntrada, fechaSalida } = this.reservaForm.getRawValue();
    this.minSalida.set(fechaEntrada || this.hoyISO);

    if (!fechaEntrada || !fechaSalida) {
      this.noches.set(0);
      this.totalEstimado.set(0);
      return;
    }

    const entrada = new Date(`${fechaEntrada}T00:00:00`);
    const salida = new Date(`${fechaSalida}T00:00:00`);
    const diferencia = Math.round((salida.getTime() - entrada.getTime()) / 86400000);
    const servicio = this.servicioSeleccionado();

    if (diferencia > 0 && servicio) {
      this.noches.set(diferencia);
      this.totalEstimado.set(diferencia * servicio.precio);
    } else {
      this.noches.set(0);
      this.totalEstimado.set(0);
    }
  }
}
