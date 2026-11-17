import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RangoOcupado, Reserva, Servicio } from '../../../core/models/models';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { imagenPrincipalDeServicio } from '../../../core/utils/imagenes-suite';
import {
  DateRangeCalendarComponent,
  RangoSeleccionado
} from '../../catalogo/date-range-calendar/date-range-calendar.component';

type PasoReserva = 'fechas' | 'pago' | 'procesando' | 'exito';

@Component({
  selector: 'app-reserva-wizard',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DateRangeCalendarComponent],
  templateUrl: './reserva-wizard.component.html',
  styleUrl: './reserva-wizard.component.css'
})
export class ReservaWizardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);

  @Input({ required: true }) servicio!: Servicio;
  @Output() cerrar = new EventEmitter<void>();
  @Output() reservada = new EventEmitter<Reserva>();

  readonly paso = signal<PasoReserva>('fechas');
  readonly ocupados = signal<RangoOcupado[]>([]);
  readonly cargandoOcupados = signal(true);
  readonly errorOcupados = signal('');
  readonly rango = signal<RangoSeleccionado | null>(null);
  readonly errorFechas = signal('');
  readonly errorPago = signal('');
  readonly reservaConfirmada = signal<Reserva | null>(null);

  readonly notas = this.fb.nonNullable.control('', [Validators.maxLength(250)]);

  // Simulación de pasarela: no se envía ningún dato de tarjeta al backend.
  readonly pagoForm = this.fb.nonNullable.group({
    titular: ['', [Validators.required, Validators.minLength(3)]],
    numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  enviadoPago = false;

  readonly noches = computed(() => {
    const rango = this.rango();
    if (!rango) {
      return 0;
    }
    const entrada = new Date(`${rango.entrada}T00:00:00`).getTime();
    const salida = new Date(`${rango.salida}T00:00:00`).getTime();
    return Math.max(0, Math.round((salida - entrada) / 86400000));
  });

  readonly subtotal = computed(() => this.noches() * this.servicio.precio);
  readonly total = computed(() => this.subtotal());

  get imagenPrincipal(): string {
    return imagenPrincipalDeServicio(this.servicio);
  }

  readonly codigoReserva = computed(() => {
    const reserva = this.reservaConfirmada();
    return reserva?.id ? `AND-${String(reserva.id).padStart(4, '0')}` : '—';
  });

  private temporizador?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.cargarOcupados();
  }

  ngOnDestroy(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
  }

  get titular() {
    return this.pagoForm.controls.titular;
  }

  get numeroTarjeta() {
    return this.pagoForm.controls.numeroTarjeta;
  }

  get vencimiento() {
    return this.pagoForm.controls.vencimiento;
  }

  get cvv() {
    return this.pagoForm.controls.cvv;
  }

  cargarOcupados(): void {
    this.cargandoOcupados.set(true);
    this.errorOcupados.set('');

    this.reservaService.getFechasOcupadas(this.servicio.id!).subscribe({
      next: (rangos) => {
        this.ocupados.set(rangos);
        this.cargandoOcupados.set(false);
      },
      error: (error: Error) => {
        this.cargandoOcupados.set(false);
        this.errorOcupados.set(error.message);
      }
    });
  }

  seleccionarRango(rango: RangoSeleccionado | null): void {
    this.rango.set(rango);
    if (rango) {
      this.errorFechas.set('');
    }
  }

  continuarPago(): void {
    if (!this.rango()) {
      this.errorFechas.set('Selecciona una fecha de entrada y una de salida para continuar.');
      return;
    }

    this.errorFechas.set('');
    this.paso.set('pago');
  }

  volverFechas(): void {
    this.errorPago.set('');
    this.paso.set('fechas');
  }

  pagar(): void {
    this.enviadoPago = true;
    this.errorPago.set('');

    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const rango = this.rango();
    if (!rango) {
      this.paso.set('fechas');
      this.errorFechas.set('Vuelve a seleccionar tus fechas.');
      return;
    }

    this.paso.set('procesando');
    this.temporizador = setTimeout(() => {
      this.reservaService.crearReserva({
        servicioId: this.servicio.id!,
        fechaEntrada: rango.entrada,
        fechaSalida: rango.salida,
        notas: this.notas.value.trim() || undefined
      }).subscribe({
        next: (reserva) => {
          this.reservaConfirmada.set(reserva);
          this.paso.set('exito');
          this.pagoForm.reset();
          this.toastService.exito(`Reserva ${this.codigoReserva()} confirmada`);
          this.reservada.emit(reserva);
        },
        error: (error: Error) => {
          this.paso.set('pago');
          this.errorPago.set(error.message);
          this.toastService.error(error.message);
        }
      });
    }, 1600);
  }

  cerrarPanel(): void {
    if (this.paso() === 'procesando') {
      return;
    }
    this.cerrar.emit();
  }

  formatearFecha(iso: string | null | undefined): string {
    if (!iso) {
      return 'Por elegir';
    }
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
  }
}
