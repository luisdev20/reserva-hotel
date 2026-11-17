# Sistema de Reservas — Andes Suites

Aplicación web para la gestión de reservas hoteleras, desarrollada con **Spring Boot** (backend REST) y **Angular** (frontend SPA).

El sistema permite consultar suites y servicios, filtrar por precio, registrar usuarios, reservar con validación de fechas y disponibilidad, cancelar reservas y administrar el catálogo desde un panel con roles.

> Documentación de estudio y sustento de la rúbrica: [`DOCUMENTACION_RUBRICA.md`](./DOCUMENTACION_RUBRICA.md)

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java (JDK) | 17 |
| Maven | Incluido (`mvnw`) |
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 21+ |

---

## Estructura del proyecto

```
sistemaReserva/
├── src/                                  # Backend Spring Boot
│   └── main/java/sistemaReserva/
│       ├── controller/                   # Endpoints REST
│       ├── service/                      # Lógica de negocio
│       ├── repository/                   # Acceso a datos (JPA + JPQL)
│       ├── model/                        # Entidades JPA
│       ├── dto/                          # Objetos de transferencia
│       ├── security/                     # JWT, filtros y roles
│       ├── exception/                    # Manejo global de errores
│       └── config/                       # Datos iniciales
├── frontend/                             # Frontend Angular 21
│   └── src/
│       ├── app/
│       │   ├── core/                     # Modelos, servicios, guards, interceptores y validadores
│       │   ├── shared/                   # Navbar y notificaciones reutilizables
│       │   ├── features/                 # Catálogo, autenticación, reservas y admin
│       │   ├── app.routes.ts             # Rutas con lazy loading y guards
│       │   └── app.config.ts             # Providers globales
│       ├── environments/                 # URL centralizada de la API
│       └── styles.css                    # Sistema de diseño global
├── DOCUMENTACION_RUBRICA.md              # Guía de estudio y exposición
└── pom.xml
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/luisdev20/reserva-hotel.git
cd reserva-hotel
```

### 2. Ejecutar el backend (Spring Boot)

```bash
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

> La base de datos H2 es **en memoria**: se crea automáticamente al iniciar y se puebla con datos de prueba. No requiere instalación adicional. Cada reinicio restaura los datos iniciales.

### 3. Ejecutar el frontend (Angular)

En una segunda terminal:

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

### 4. Ejecutar las pruebas

```bash
# Backend (10 pruebas de integración)
./mvnw test

# Frontend (2 pruebas de la aplicación Angular)
cd frontend
npx ng test --watch=false
```

---

## Configuración

El backend se configura en `src/main/resources/application.properties`.

| Propiedad | Descripción |
|---|---|
| `server.port` | Puerto del backend (default: `8080`) |
| `app.jwt.secret` | Clave secreta para firmar tokens JWT |
| `app.jwt.expiration-ms` | Duración del token en milisegundos |

El frontend centraliza la URL del backend en `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

> **No compartas** el valor real de `app.jwt.secret` en repositorios públicos. En producción, usa variables de entorno.

### Migrar a MySQL (opcional)

Comenta las líneas de H2 en `application.properties` y descomenta las de MySQL al final del archivo, ajustando usuario y contraseña según tu entorno local.

---

## Credenciales de prueba (solo desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@andessuites.com` | `admin123` |
| Cliente | `cliente@andessuites.com` | `cliente123` |

> Estas cuentas se crean automáticamente al iniciar el backend. **No usar en producción.**

---

## Rutas del frontend

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Catálogo de suites | Público |
| `/nosotros` | Historia de la fundadora y del hotel | Público |
| `/login` | Inicio de sesión | Solo visitantes |
| `/registro` | Registro de cliente | Solo visitantes |
| `/mis-reservas` | Reservas del cliente | Sesión activa |
| `/admin` | Panel administrativo | Solo `ADMIN` |
| `**` | Página no encontrada | Público |

Las rutas usan **lazy loading**, títulos por página y guards (`authGuard`, `adminGuard`, `guestGuard`).

---

## Endpoints principales

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/auth/perfil` | Perfil del usuario autenticado | Sesión |
| `GET` | `/api/auth/usuarios` | Listar usuarios | Admin |
| `GET` | `/api/servicios` | Listar suites/servicios | Público |
| `GET` | `/api/servicios/buscar?precioMax={n}` | Filtrar por precio (JPQL) | Público |
| `GET` | `/api/servicios/buscar?fechaEntrada={f}&fechaSalida={f}&precioMax={n}` | Suites libres en un rango de fechas | Público |
| `GET` | `/api/servicios/{id}/ocupacion` | Rangos ocupados para el calendario | Público |
| `GET` | `/api/servicios/{id}` | Detalle de un servicio | Público |
| `POST` | `/api/servicios` | Crear servicio | Admin |
| `PUT` | `/api/servicios/{id}` | Actualizar servicio | Admin |
| `DELETE` | `/api/servicios/{id}` | Eliminar servicio | Admin |
| `GET` | `/api/categorias` | Listar categorías | Público |
| `POST` | `/api/reservas` | Crear reserva | Sesión |
| `GET` | `/api/reservas/mis-reservas` | Reservas propias | Sesión |
| `GET` | `/api/reservas` | Todas las reservas | Admin |
| `PUT` | `/api/reservas/{id}/cancelar` | Cancelar reserva | Dueño o admin |

### Reglas de negocio de las reservas

- La fecha de entrada no puede ser anterior a hoy.
- La fecha de salida debe ser posterior a la entrada.
- No se permite reservar una suite que se cruce con otra reserva activa (control de sobreventa).
- Una reserva cancelada libera el rango de fechas.
- No se puede cancelar dos veces la misma reserva.
- El total se calcula en el backend: `noches × precio de la suite`.
- Un servicio con reservas asociadas no se puede eliminar; se debe marcar como no disponible.
- El registro público siempre crea usuarios con rol `CLIENTE`.

Los errores se devuelven como JSON uniforme:

```json
{ "error": "La suite ya está reservada en el rango de fechas seleccionado. Elige otras fechas." }
```

Las respuestas de seguridad también son JSON: `401` para sesión ausente o expirada y `403` para permisos insuficientes.

### Flujo de reserva en el frontend

1. El catálogo permite filtrar por rango de fechas y precio máximo.
2. Al abrir una suite, el calendario consulta `/api/servicios/{id}/ocupacion` y bloquea los días ya reservados.
3. El cliente elige entrada y salida; el panel izquierdo muestra noches, subtotal y total.
4. Se simula una pasarela de pago (no se guardan datos de tarjeta).
5. Recién al confirmar el pago simulado se crea la reserva en el backend, que vuelve a validar el solapamiento.
6. La pantalla final muestra el código de reserva y el acceso a “Mis reservas”.

---

## Tecnologías utilizadas

**Backend**
- Spring Boot 4
- Spring Security + JWT
- Spring Data JPA / Hibernate
- Bean Validation
- Base de datos H2 (en memoria)

**Frontend**
- Angular 21 con componentes standalone
- TypeScript
- Reactive Forms
- Signals
- HttpClient + interceptores funcionales
- CSS personalizado responsive

---

## Consola H2 (solo desarrollo)

Disponible en `http://localhost:8080/h2-console` mientras el backend esté corriendo.

- **JDBC URL:** `jdbc:h2:mem:hoteldb`
- **Usuario:** `sa`
- **Contraseña:** *(vacía)*
