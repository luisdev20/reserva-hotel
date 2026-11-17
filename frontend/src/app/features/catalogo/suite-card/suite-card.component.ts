import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Servicio } from '../../../core/models/models';
import { imagenesDeServicio } from '../../../core/utils/imagenes-suite';

@Component({
  selector: 'app-suite-card',
  standalone: true,
  templateUrl: './suite-card.component.html',
  styleUrl: './suite-card.component.css'
})
export class SuiteCardComponent {
  @Input({ required: true }) servicio!: Servicio;
  @Output() reservar = new EventEmitter<Servicio>();

  readonly indice = signal(0);

  get imagenes(): string[] {
    return imagenesDeServicio(this.servicio);
  }

  anterior(): void {
    this.indice.update((actual) => (actual - 1 + this.imagenes.length) % this.imagenes.length);
  }

  siguiente(): void {
    this.indice.update((actual) => (actual + 1) % this.imagenes.length);
  }

  irA(indice: number): void {
    this.indice.set(indice);
  }

  solicitarReserva(): void {
    if (this.servicio.disponible) {
      this.reservar.emit(this.servicio);
    }
  }
}
