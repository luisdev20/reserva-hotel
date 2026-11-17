import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  // Formulario reactivo: los validadores viven en el componente, no en el HTML.
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly cargando = signal(false);
  readonly errorMsg = signal('');
  readonly mostrarPassword = signal(false);
  enviado = false;

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  iniciarSesion(): void {
    this.enviado = true;
    this.errorMsg.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.toastService.exito(`Bienvenido, ${respuesta.nombre}`);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destino = returnUrl ?? (respuesta.rol === 'ADMIN' ? '/admin' : '/');
        this.router.navigateByUrl(destino);
      },
      error: (error: Error) => {
        this.cargando.set(false);
        this.errorMsg.set(error.message);
      }
    });
  }

  alternarPassword(): void {
    this.mostrarPassword.update((visible) => !visible);
  }
}
