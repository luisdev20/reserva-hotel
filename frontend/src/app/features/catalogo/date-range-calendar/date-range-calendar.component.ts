import { Component, computed, input, output, signal } from '@angular/core';
import { RangoOcupado } from '../../../core/models/models';
import { fechaLocalISO } from '../../../core/validators/date-range.validator';

interface DiaCalendario {
  fecha: Date;
  iso: string;
  dia: number;
  delMes: boolean;
  pasado: boolean;
  ocupado: boolean;
  seleccionado: boolean;
  enRango: boolean;
  esEntrada: boolean;
  esSalida: boolean;
}

export interface RangoSeleccionado {
  entrada: string;
  salida: string;
}

@Component({
  selector: 'app-date-range-calendar',
  standalone: true,
  templateUrl: './date-range-calendar.component.html',
  styleUrl: './date-range-calendar.component.css'
})
export class DateRangeCalendarComponent {
  // Rangos que ya tienen una reserva activa.
  readonly ocupados = input<RangoOcupado[]>([]);
  readonly rangoSeleccionado = output<RangoSeleccionado | null>();

  readonly semana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly hoyISO = fechaLocalISO(new Date());

  readonly mesActual = signal(this.primerDiaDelMes(new Date()));
  readonly entrada = signal<string | null>(null);
  readonly salida = signal<string | null>(null);
  readonly error = signal('');

  readonly etiquetaMes = computed(() => {
    const texto = this.mesActual().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });

  readonly puedeRetroceder = computed(() => {
    const actual = this.mesActual();
    const hoy = new Date();
    return actual.getFullYear() > hoy.getFullYear() ||
      (actual.getFullYear() === hoy.getFullYear() && actual.getMonth() > hoy.getMonth());
  });

  readonly puedeAvanzar = computed(() => {
    const actual = this.mesActual();
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear(), hoy.getMonth() + 18, 1);
    return actual.getTime() < limite.getTime();
  });

  readonly dias = computed<DiaCalendario[]>(() => {
    const primero = this.mesActual();
    const anio = primero.getFullYear();
    const mes = primero.getMonth();
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const desplazamiento = (primero.getDay() + 6) % 7;
    const entrada = this.entrada();
    const salida = this.salida();

    return Array.from({ length: 42 }, (_, indice) => {
      const fecha = new Date(anio, mes, indice - desplazamiento + 1);
      const iso = fechaLocalISO(fecha);
      const delMes = fecha.getMonth() === mes;

      return {
        fecha,
        iso,
        dia: fecha.getDate(),
        delMes,
        pasado: iso < this.hoyISO,
        ocupado: delMes && this.estaOcupado(iso),
        seleccionado: iso === entrada || iso === salida,
        enRango: !!entrada && !!salida && iso > entrada && iso < salida,
        esEntrada: iso === entrada,
        esSalida: iso === salida
      };
    });
  });

  seleccionar(dia: DiaCalendario): void {
    if (!dia.delMes || dia.pasado || dia.ocupado) {
      return;
    }

    const entrada = this.entrada();
    const salida = this.salida();

    // Primer clic o inicio de una selección nueva.
    if (!entrada || (entrada && salida) || dia.iso <= entrada) {
      this.entrada.set(dia.iso);
      this.salida.set(null);
      this.error.set('');
      this.rangoSeleccionado.emit(null);
      return;
    }

    if (!this.rangoLibre(entrada, dia.iso)) {
      this.error.set('El rango incluye un día ocupado. Elige otras fechas.');
      return;
    }

    this.salida.set(dia.iso);
    this.error.set('');
    this.rangoSeleccionado.emit({ entrada, salida: dia.iso });
  }

  limpiar(): void {
    this.entrada.set(null);
    this.salida.set(null);
    this.error.set('');
    this.rangoSeleccionado.emit(null);
  }

  mesAnterior(): void {
    if (!this.puedeRetroceder()) {
      return;
    }
    const actual = this.mesActual();
    this.mesActual.set(new Date(actual.getFullYear(), actual.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    if (!this.puedeAvanzar()) {
      return;
    }
    const actual = this.mesActual();
    this.mesActual.set(new Date(actual.getFullYear(), actual.getMonth() + 1, 1));
  }

  formatear(iso: string | null): string {
    if (!iso) {
      return '—';
    }
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  etiquetaDia(dia: DiaCalendario): string {
    return dia.fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  private estaOcupado(iso: string): boolean {
    return this.ocupados().some((rango) => rango.fechaEntrada <= iso && iso < rango.fechaSalida);
  }

  private rangoLibre(entrada: string, salida: string): boolean {
    return !this.ocupados().some((rango) => rango.fechaEntrada < salida && rango.fechaSalida > entrada);
  }

  private primerDiaDelMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }
}
