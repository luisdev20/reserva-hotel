import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegistroRequest } from '../../../core/models/models';
import { passwordsIgualesValidator } from '../../../core/validators/password-match.validator';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly form = this.fb.nonNullable.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÜáéíóúüÑñ\s]+$/)
        ]
      ],
      apellido: ['', [Validators.pattern(/^[a-zA-ZÁÉÍÓÚÜáéíóúüÑñ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    },
    { validators: passwordsIgualesValidator }
  );

  readonly cargando = signal(false);
  readonly errorMsg = signal('');
  readonly mostrarPassword = signal(false);
  enviado = false;

  get nombre() {
    return this.form.controls.nombre;
  }

  get apellido() {
    return this.form.controls.apellido;
  }

  get email() {
    return this.form.controls.email;
  }

  get telefono() {
    return this.form.controls.telefono;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmarPassword() {
    return this.form.controls.confirmarPassword;
  }

  get aceptaTerminos() {
    return this.form.controls.aceptaTerminos;
  }

  registrar(): void {
    this.enviado = true;
    this.errorMsg.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const payload: RegistroRequest = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim() || undefined,
      email: valores.email.trim().toLowerCase(),
      telefono: valores.telefono.trim() || undefined,
      password: valores.password,
      rol: 'CLIENTE'
    };

    this.cargando.set(true);
    this.authService.register(payload).subscribe({
      next: () => {
        this.cargando.set(false);
        this.toastService.exito('Cuenta creada correctamente. Ya puedes reservar.');
        this.router.navigate(['/']);
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
