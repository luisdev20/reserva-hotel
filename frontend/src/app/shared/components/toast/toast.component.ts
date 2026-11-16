import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  cerrar(id: number): void {
    this.toastService.cerrar(id);
  }
}
