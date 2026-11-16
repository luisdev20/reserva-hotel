import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

// Servicio global para mostrar notificaciones breves en cualquier pantalla.
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private contador = 0;

  mostrar(mensaje: string, tipo: ToastTipo = 'info', duracionMs = 4000): void {
    const id = ++this.contador;
    this._toasts.update((actuales) => [...actuales, { id, mensaje, tipo }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'success');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error', 5000);
  }

  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }

  cerrar(id: number): void {
    this._toasts.update((actuales) => actuales.filter((toast) => toast.id !== id));
  }
}
