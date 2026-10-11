import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Categoria, Reserva, Servicio } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiBase = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Listar servicios / suites
  getServicios(soloDisponibles = false): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiBase}/servicios?soloDisponibles=${soloDisponibles}`);
  }

  // Filtrar servicios con la consulta JPQL por precio máximo
  buscarPorPrecioMax(precioMax: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiBase}/servicios/buscar?precioMax=${precioMax}`);
  }

  // Listar categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiBase}/categorias`);
  }

  // Crear servicio (Requiere rol ADMIN)
  crearServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.apiBase}/servicios`, servicio, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Actualizar servicio (Requiere rol ADMIN)
  actualizarServicio(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiBase}/servicios/${id}`, servicio, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Eliminar servicio (Requiere rol ADMIN)
  eliminarServicio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBase}/servicios/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Crear reserva
  crearReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiBase}/reservas`, reserva, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Listar reservas del usuario actual (Cliente)
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiBase}/reservas/mis-reservas`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Listar todas las reservas (Admin)
  getTodasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiBase}/reservas`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Cancelar reserva
  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiBase}/reservas/${id}/cancelar`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
