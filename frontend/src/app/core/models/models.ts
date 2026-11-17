// Modelos e interfaces TypeScript compartidos por toda la aplicación.

export type Rol = 'ADMIN' | 'CLIENTE';
export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  rol: Rol;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  capacidad: number;
  imagenUrl?: string;
  disponible: boolean;
  categoriaId: number;
  categoriaNombre?: string;
}

export interface Reserva {
  id?: number;
  servicioId: number;
  servicioNombre?: string;
  servicioPrecio?: number;
  usuarioId?: number;
  usuarioEmail?: string;
  usuarioNombreCompleto?: string;
  fechaEntrada: string;
  fechaSalida: string;
  total?: number;
  estado?: EstadoReserva;
  notas?: string;
  fechaCreacion?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  rol: Rol;
  mensaje?: string;
}

// Contratos de entrada de la API REST.
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  password: string;
  rol: Rol;
}

// Rango que ya está ocupado por otra reserva (check-out exclusivo).
export interface RangoOcupado {
  fechaEntrada: string;
  fechaSalida: string;
}

export interface CrearReservaRequest {
  servicioId: number;
  fechaEntrada: string;
  fechaSalida: string;
  notas?: string;
}
