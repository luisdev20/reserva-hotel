// Modelos e interfaces TypeScript para Andes Suites

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  rol: 'ADMIN' | 'CLIENTE';
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
  estado?: string;
  notas?: string;
  fechaCreacion?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'ADMIN' | 'CLIENTE';
  mensaje?: string;
}
