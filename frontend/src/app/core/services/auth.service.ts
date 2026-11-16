import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'andes_token';
  private readonly userKey = 'andes_user';

  // Signal con la sesión actual: la navbar y los guards se actualizan solos.
  private readonly _usuario = signal<AuthResponse | null>(this.leerUsuario());
  readonly usuario = this._usuario.asReadonly();
  readonly isLoggedIn = computed(() => this._usuario() !== null);
  readonly isAdmin = computed(() => this._usuario()?.rol === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  register(datos: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, datos).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._usuario.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthResponse | null {
    return this._usuario();
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    localStorage.setItem(this.tokenKey, respuesta.token);
    localStorage.setItem(this.userKey, JSON.stringify(respuesta));
    this._usuario.set(respuesta);
  }

  private leerUsuario(): AuthResponse | null {
    const token = localStorage.getItem(this.tokenKey);
    const datos = localStorage.getItem(this.userKey);
    if (!token || !datos) {
      return null;
    }

    try {
      return JSON.parse(datos) as AuthResponse;
    } catch {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
