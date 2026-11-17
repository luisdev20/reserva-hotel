import { Servicio } from '../models/models';

// Cada servicio tiene tres ilustraciones locales. Se eligen por nombre para que
// el catálogo pueda crecer sin modificar la base de datos.
const GRUPOS = [
  { clave: 'cordillera', prefijo: 'cordillera' },
  { clave: 'andina', prefijo: 'andina' },
  { clave: 'cumbre', prefijo: 'cumbre' },
  { clave: 'spa', prefijo: 'spa' },
  { clave: 'bienestar', prefijo: 'spa' },
  { clave: 'termal', prefijo: 'spa' },
  { clave: 'cena', prefijo: 'cena' },
  { clave: 'gastronom', prefijo: 'cena' },
  { clave: 'restaurante', prefijo: 'cena' }
];

export function imagenesDeServicio(servicio: Servicio): string[] {
  const nombre = (servicio.nombre ?? '').toLowerCase();
  const grupo = GRUPOS.find((item) => nombre.includes(item.clave));
  const prefijo = grupo?.prefijo ?? 'generica';

  return [1, 2, 3].map((numero) => `assets/img/suites/${prefijo}-${numero}.svg`);
}

export function imagenPrincipalDeServicio(servicio: Servicio): string {
  return imagenesDeServicio(servicio)[0];
}
