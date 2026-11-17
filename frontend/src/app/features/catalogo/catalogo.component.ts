import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Servicio } from '../../core/models/models';
import { fechaLocalISO, rangoFechasValidator } from '../../core/validators/date-range.validator';
import { SuiteCardComponent } from './suite-card/suite-card.component';
import { ReservaWizardComponent } from '../reservas/reserva-wizard/reserva-wizard.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SuiteCardComponent, ReservaWizardComponent],
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
  readonly filtroResumen = signal('');
  readonly errorFiltro = signal('');

  readonly servicioSeleccionado = signal<Servicio | null>(null);
  readonly hoyISO = fechaLocalISO(new Date());

  // Filtro combinado: rango de fechas y precio máximo.
  // El validador de grupo comprueba que la salida sea posterior a la entrada.
  readonly filtroForm = this.fb.group(
    {
      precioMax: [null as number | null, [Validators.min(1)]],
      fechaEntrada: [''],
      fechaSalida: ['']
    },
    { validators: rangoFechasValidator }
  );

  ngOnInit(): void {
    this.cargarServicios();
  }

  get precioMax() {
    return this.filtroForm.controls.precioMax;
  }

  get fechaEntradaFiltro() {
    return this.filtroForm.controls.fechaEntrada;
  }

  get fechaSalidaFiltro() {
    return this.filtroForm.controls.fechaSalida;
  }

  scrollACatalogo(): void {
    document.getElementById('catalogo-seccion')?.scrollIntoView({ behavior: 'smooth' });
  }

  cargarServicios(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.errorFiltro.set('');

    this.reservaService.getServicios().subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.filtroAplicado.set(false);
        this.filtroResumen.set('');
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  aplicarFiltros(): void {
    this.errorFiltro.set('');

    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    const valores = this.filtroForm.getRawValue();
    const precioMax = valores.precioMax;
    const fechaEntrada = valores.fechaEntrada ?? '';
    const fechaSalida = valores.fechaSalida ?? '';

    if ((fechaEntrada && !fechaSalida) || (!fechaEntrada && fechaSalida)) {
      this.errorFiltro.set('Selecciona la fecha de entrada y la de salida para buscar disponibilidad.');
      return;
    }

    if (!fechaEntrada && (!precioMax || precioMax <= 0)) {
      this.cargarServicios();
      return;
    }

    this.cargando.set(true);

    const peticion = fechaEntrada && fechaSalida
      ? this.reservaService.buscarDisponibles(fechaEntrada, fechaSalida, precioMax)
      : this.reservaService.buscarPorPrecioMax(precioMax!);

    peticion.subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.filtroAplicado.set(true);
        this.filtroResumen.set(this.describirFiltro(fechaEntrada, fechaSalida, precioMax));
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroForm.reset({ precioMax: null, fechaEntrada: '', fechaSalida: '' });
    this.errorFiltro.set('');
    this.cargarServicios();
  }

  abrirReserva(servicio: Servicio): void {
    if (!servicio.disponible) {
      this.toastService.info('Esta suite no está disponible por el momento.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    this.servicioSeleccionado.set(servicio);
  }

  cerrarReserva(): void {
    this.servicioSeleccionado.set(null);
  }

  private describirFiltro(entrada: string, salida: string, precioMax: number | null): string {
    const rango = entrada && salida
      ? `Del ${this.formatearFecha(entrada)} al ${this.formatearFecha(salida)}`
      : '';
    const precio = precioMax ? `Hasta S/ ${precioMax} por noche` : '';

    return [rango, precio].filter(Boolean).join(' · ');
  }

  private formatearFecha(iso: string): string {
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
  }
}
