# HOTEL ANDES SUITES — GUÍA TÉCNICA DEL PROYECTO

Proyecto Integrador: **Plataforma Web de Gestión de Reservas y Servicios**  
Arquitectura: **Full Stack (Spring Boot REST API + Frontend Angular SPA)**  
Base de Datos: **Relacional H2 en memoria (con consola en `/h2-console`)**  
Seguridad: **Spring Security + JWT (JSON Web Tokens)**

---

## 1. CUMPLIMIENTO DE LA RÚBRICA DE EVALUACIÓN

| Criterio | Puntos | Implementación en el Proyecto |
| :--- | :---: | :--- |
| **1. Arquitectura Spring Boot** | **3 pts** | Arquitectura por capas estricta: `controller` &rarr; `service` &rarr; `repository` &rarr; `model` / `dto`. Desacoplamiento total de responsabilidades. |
| **2. API REST y CRUD completo** | **4 pts** | Endpoints RESTful con métodos HTTP correctos (GET, POST, PUT, DELETE) y códigos de estado estándar (200, 201, 400, 401, 403, 404). CRUD completo para Servicios/Suites. |
| **3. Dependency Injection y DTOs** | **2 pts** | Inyección de dependencias con `@Autowired`. Uso de DTOs en entrada y salida (`LoginRequestDTO`, `RegisterRequestDTO`, `AuthResponseDTO`, `ServicioDTO`, `ReservaDTO`, `ReservaResponseDTO`, `UsuarioResponseDTO`). |
| **4. Persistencia JPA / Hibernate** | **4 pts** | Entidades relacionales: `Usuario`, `Categoria`, `Servicio` (`@ManyToOne` con `Categoria`), y `Reserva` (`@ManyToOne` con `Usuario` y `Servicio`). |
| **5. Consultas JPQL y BD** | **2 pts** | Consultas derivadas de Spring Data JPA y consultas personalizadas con `@Query` (JPQL) para filtrar servicios por precio máximo (`buscarDisponiblesPorPrecioMaximo`) y reservas por email de usuario. |
| **6. Seguridad Spring Security** | **3 pts** | `JwtAuthenticationFilter` integrado en `SecurityFilterChain`. Endpoints públicos vs protegidos por rol (`ROLE_ADMIN` y `ROLE_CLIENTE`). Encriptación de contraseñas con BCrypt. |
| **7. Documentación y evidencias** | **2 pts** | Repositorio organizado, guía paso a paso, ejemplos de prueba cURL/Postman, datos precargados y pruebas unitarias automáticas pasando al 100%. |

---

## 2. ESTRUCTURA DEL BACKEND (SPRING BOOT)

```
src/main/java/sistemaReserva/
├── config/
│   └── DataInitializer.java          # Precarga de datos: categorías, suites, usuarios y reserva
├── controller/
│   ├── AuthController.java           # POST /login, POST /register, GET /perfil, GET /usuarios
│   ├── ServicioController.java       # CRUD completo de servicios y suites (GET, POST, PUT, DELETE)
│   ├── ReservaController.java        # POST /reservas, GET /mis-reservas, GET /reservas, PUT /cancelar
│   └── CategoriaController.java      # GET /categorias
├── exception/
│   └── GlobalExceptionHandler.java   # Errores de validación en formato JSON uniforme
├── dto/
│   ├── AuthResponseDTO.java          # Datos devueltos tras login/registro + JWT
│   ├── LoginRequestDTO.java          # Credenciales de inicio de sesión
│   ├── RegisterRequestDTO.java       # Datos de nuevo usuario
│   ├── ServicioDTO.java              # Transferencia de datos de servicios/suites
│   ├── ReservaDTO.java               # Solicitud de creación de reserva
│   ├── ReservaResponseDTO.java       # Respuesta con detalle de la reserva
│   └── UsuarioResponseDTO.java       # Datos de usuario seguros (sin contraseña)
├── model/
│   ├── Categoria.java                # Tabla 'categorias'
│   ├── Servicio.java                 # Tabla 'servicios' (@ManyToOne Categoria)
│   ├── Usuario.java                  # Tabla 'usuarios'
│   └── Reserva.java                  # Tabla 'reservas' (@ManyToOne Usuario, @ManyToOne Servicio)
├── repository/
│   ├── CategoriaRepository.java      # JpaRepository
│   ├── ServicioRepository.java       # JpaRepository + Consultas JPQL (@Query)
│   ├── UsuarioRepository.java        # JpaRepository (findByEmail)
│   └── ReservaRepository.java        # JpaRepository + Consultas JPQL (@Query)
├── security/
│   ├── JwtAuthenticationFilter.java  # Interceptor de tokens Bearer
│   ├── JwtUtil.java                  # Generación y validación de tokens JWT
│   └── SecurityConfig.java           # Reglas de acceso, roles y CORS
└── service/
    ├── UsuarioService.java           # Lógica de login, registro y perfil
    ├── ServicioService.java          # Lógica CRUD y filtros JPQL de servicios
    └── ReservaService.java           # Lógica de creación, cancelación y cálculo de total
```

---

## 3. ESTRUCTURA DEL FRONTEND (ANGULAR 21)

Ubicado en la carpeta `/frontend`:
- **Estilo**: Basado 100% en el diseño de Andes Suites (`plantilla_estilo`), con paleta de colores cordilleranos (`--night: #1B2430`, `--cream: #F5F1E8`, `--gold: #C9A66B`) y tipografía Google Fonts (*Fraunces* y *Work Sans*).
- **Organización**: componentes standalone separados en `core` (modelos, servicios, guards, interceptores y validadores), `shared` (navbar y notificaciones) y `features` (catálogo, autenticación, reservas y admin).
- **Rutas y Componentes** (con lazy loading):
  - `/` (`CatalogoComponent`): Hero banner, tarjetas de suites, filtro por precio máximo contra la consulta JPQL y modal de reserva con formulario reactivo.
  - `/login` (`LoginComponent`): Inicio de sesión con validaciones y botones para cargar credenciales de prueba. Ruta protegida por `guestGuard`.
  - `/registro` (`RegistroComponent`): Registro de cliente con confirmación de contraseña y aceptación de términos. Ruta protegida por `guestGuard`.
  - `/admin` (`AdminComponent`): Panel del administrador con KPIs, CRUD de servicios, reservas y usuarios. Ruta protegida por `adminGuard`.
  - `/mis-reservas` (`MisReservasComponent`): Reservas del cliente y cancelación. Ruta protegida por `authGuard`.
  - `**` (`NotFoundComponent`): Página 404.
- **Comunicación HTTP**: `HttpClient` tipado, URL centralizada en `environments/environment.ts`, interceptor JWT y interceptor global de errores.

---

## 4. USUARIOS DE PRUEBA PRECARGADOS

| Rol | Correo | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@andessuites.com` | `admin123` | Gestión total de servicios (CRUD), ver todas las reservas y ver todos los usuarios. |
| **CLIENTE** | `cliente@andessuites.com` | `cliente123` | Ver catálogo, realizar reservas y consultar/cancelar sus reservas. |

---

## 5. GUÍA DE ENDPOINTS PARA PROBAR EN POSTMAN / CURL

### Módulo 1: Autenticación
1. **Login:**
   - `POST http://localhost:8080/api/auth/login`
   - Body JSON:
     ```json
     { "email": "admin@andessuites.com", "password": "admin123" }
     ```
   - Devuelve: Token JWT, nombre, rol y datos básicos.

2. **Registro:**
   - `POST http://localhost:8080/api/auth/register`
   - Body JSON:
     ```json
     {
       "nombre": "Ana",
       "apellido": "Rios",
       "email": "ana.rios@example.com",
       "password": "password123",
       "telefono": "999888777",
       "rol": "CLIENTE"
     }
     ```

3. **Perfil (Requiere Token):**
   - `GET http://localhost:8080/api/auth/perfil`
   - Header: `Authorization: Bearer <TOKEN>`

---

### Módulo 2: CRUD de Servicios (Suites)
1. **Listar todos los servicios (Público):**
   - `GET http://localhost:8080/api/servicios`

2. **Buscar por precio máximo (Consulta JPQL con `@Query`):**
   - `GET http://localhost:8080/api/servicios/buscar?precioMax=400`

3. **Crear servicio (Requiere rol ADMIN):**
   - `POST http://localhost:8080/api/servicios`
   - Header: `Authorization: Bearer <TOKEN_ADMIN>`
   - Body JSON:
     ```json
     {
       "nombre": "Suite Mirador",
       "descripcion": "Suite con balcón privado hacia el valle andino.",
       "precio": 390.0,
       "capacidad": 2,
       "disponible": true,
       "categoriaId": 1
     }
     ```
   - Retorna: Código HTTP `201 CREATED`.

4. **Actualizar servicio (Requiere rol ADMIN):**
   - `PUT http://localhost:8080/api/servicios/{id}`
   - Header: `Authorization: Bearer <TOKEN_ADMIN>`

5. **Eliminar servicio (Requiere rol ADMIN):**
   - `DELETE http://localhost:8080/api/servicios/{id}`
   - Header: `Authorization: Bearer <TOKEN_ADMIN>`

---

### Módulo 3: Gestión de Reservas
1. **Crear reserva (Requiere token de usuario):**
   - `POST http://localhost:8080/api/reservas`
   - Header: `Authorization: Bearer <TOKEN>`
   - Body JSON:
     ```json
     {
       "servicioId": 1,
       "fechaEntrada": "2026-11-01",
       "fechaSalida": "2026-11-04",
       "notas": "Cama adicional si es posible"
     }
     ```

   **Reglas aplicadas por el backend:**
   - La fecha de entrada no puede ser anterior a hoy.
   - La fecha de salida debe ser posterior a la entrada.
   - No se permite una reserva que se cruce con otra reserva activa de la misma suite (control de sobreventa).
   - Si hay solapamiento, responde `400` con `{"error":"La suite ya está reservada..."}`.

2. **Consultar mis reservas (Cliente):**
   - `GET http://localhost:8080/api/reservas/mis-reservas`
   - Header: `Authorization: Bearer <TOKEN>`

3. **Listar todas las reservas (Admin):**
   - `GET http://localhost:8080/api/reservas`
   - Header: `Authorization: Bearer <TOKEN_ADMIN>`

4. **Cancelar reserva:**
   - `PUT http://localhost:8080/api/reservas/{id}/cancelar`
   - Header: `Authorization: Bearer <TOKEN>`

---

## 6. CÓMO EJECUTAR EL PROYECTO

### Backend (Spring Boot)
1. Abrir terminal en la raíz del proyecto.
2. Ejecutar:
   ```bash
   ./mvnw spring-boot:run
   ```
3. El servidor iniciará en: `http://localhost:8080`
4. Consola H2 para inspeccionar tablas: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:hoteldb`
   - User: `sa`
   - Password: (en blanco)

### Frontend (Angular)
1. Abrir terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   npm start
   ```
2. Abrir el navegador en `http://localhost:4200`
