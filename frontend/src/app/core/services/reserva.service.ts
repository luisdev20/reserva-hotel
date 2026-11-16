import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CrearReservaRequest, Reserva, Servicio } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Catálogo público
  getServicios(soloDisponibles = false): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/servicios`, {
      params: { soloDisponibles }
    });
  }

  // Consulta JPQL del backend: servicios con precio menor o igual al indicado
  buscarPorPrecioMax(precioMax: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/servicios/buscar`, {
      params: { precioMax }
    });
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  // CRUD de servicios (solo ADMIN)
  crearServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.apiUrl}/servicios`, servicio);
  }

  actualizarServicio(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/servicios/${id}`, servicio);
  }

  eliminarServicio(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/servicios/${id}`);
  }

  // Reservas del usuario autenticado
  crearReserva(reserva: CrearReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/reservas`, reserva);
  }

  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/mis-reservas`);
  }

  getTodasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas`);
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/reservas/${id}/cancelar`, {});
  }
}
