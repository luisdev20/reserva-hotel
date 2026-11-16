import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Valida que "confirmarPassword" coincida con "password".
export const passwordsIgualesValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmarPassword = group.get('confirmarPassword')?.value;

  if (!password || !confirmarPassword) {
    return null;
  }

  return password === confirmarPassword ? null : { passwordsDistintas: true };
};
