import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Valida que la fecha de entrada no sea pasada y que la salida sea posterior.
// Se aplica al grupo completo porque necesita comparar dos controles.
export const rangoFechasValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const entrada = group.get('fechaEntrada')?.value as string | null;
  const salida = group.get('fechaSalida')?.value as string | null;

  if (!entrada || !salida) {
    return null;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaEntrada = new Date(`${entrada}T00:00:00`);
  const fechaSalida = new Date(`${salida}T00:00:00`);

  if (fechaEntrada.getTime() < hoy.getTime()) {
    return { fechaPasada: true };
  }

  if (fechaSalida.getTime() <= fechaEntrada.getTime()) {
    return { rangoInvalido: true };
  }

  return null;
};

// Devuelve una fecha local en formato YYYY-MM-DD (sin desfase de zona horaria).
export function fechaLocalISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
