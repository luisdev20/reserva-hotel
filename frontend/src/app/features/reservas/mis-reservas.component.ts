import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { ToastService } from '../../core/services/toast.service';
import { Reserva } from '../../core/models/models';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly toastService = inject(ToastService);

  readonly reservas = signal<Reserva[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly cancelandoId = signal<number | null>(null);

  readonly confirmadas = computed(
    () => this.reservas().filter((reserva) => reserva.estado === 'CONFIRMADA').length
  );
  readonly canceladas = computed(
    () => this.reservas().filter((reserva) => reserva.estado === 'CANCELADA').length
  );
  readonly totalInvertido = computed(() =>
    this.reservas()
      .filter((reserva) => reserva.estado === 'CONFIRMADA')
      .reduce((total, reserva) => total + (reserva.total ?? 0), 0)
  );

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.reservaService.getMisReservas().subscribe({
      next: (datos) => {
        this.reservas.set(datos);
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorCarga.set(error.message);
      }
    });
  }

  cancelarReserva(id: number): void {
    if (!confirm('¿Deseas cancelar esta reserva? La suite volverá a estar disponible.')) {
      return;
    }

    this.cancelandoId.set(id);
    this.reservaService.cancelarReserva(id).subscribe({
      next: () => {
        this.cancelandoId.set(null);
        this.toastService.exito('Reserva cancelada correctamente');
        this.cargarReservas();
      },
      error: (error: Error) => {
        this.cancelandoId.set(null);
        this.toastService.error(error.message);
      }
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
