# Sistema de Reservas — Andes Suites

Aplicación web para la gestión de reservas hoteleras, desarrollada con **Spring Boot** (backend) y **Angular** (frontend).

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java (JDK) | 17 |
| Maven | Incluido (`mvnw`) |
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 17+ |

---

## Estructura del proyecto

```
sistemaReserva/
├── src/                        # Backend Spring Boot
│   └── main/java/sistemaReserva/
│       ├── controller/         # Endpoints REST
│       ├── service/            # Lógica de negocio
│       ├── repository/         # Acceso a base de datos (JPA)
│       ├── model/              # Entidades JPA
│       ├── dto/                # Objetos de transferencia de datos
│       ├── security/           # JWT y Spring Security
│       └── config/             # Inicialización de datos
├── frontend/                   # Frontend Angular
│   └── src/app/
│       ├── components/         # Vistas (login, catálogo, admin, etc.)
│       ├── services/           # Servicios HTTP hacia el backend
│       └── models/             # Interfaces TypeScript
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

> La base de datos H2 es **en memoria**: se crea automáticamente al iniciar y se puebla con datos de prueba. No requiere ninguna instalación adicional.

### 3. Ejecutar el frontend (Angular)

Abre una segunda terminal:

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

---

## Configuración

El backend se configura en `src/main/resources/application.properties`.

Los valores que debes ajustar si cambias de entorno:

| Propiedad | Descripción |
|---|---|
| `server.port` | Puerto del backend (default: `8080`) |
| `app.jwt.secret` | Clave secreta para firmar tokens JWT |
| `app.jwt.expiration-ms` | Duración del token en milisegundos |

> **No compartas** el valor de `app.jwt.secret` en repositorios públicos. En producción, usa variables de entorno.

### Migrar a MySQL (opcional)

Comenta las líneas de H2 en `application.properties` y descomenta las de MySQL al final del archivo, ajustando usuario y contraseña según tu entorno local.

---

## Credenciales de prueba (solo entorno de desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@andessuites.com` | `admin123` |
| Cliente | `cliente@andessuites.com` | `cliente123` |

> Estas cuentas se crean automáticamente al iniciar el backend. **No usar en producción.**

---

## Endpoints principales

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/servicios` | Listar suites/servicios | Público |
| `GET` | `/api/servicios/disponibles` | Solo disponibles | Público |
| `GET` | `/api/servicios/precio?max={n}` | Filtrar por precio | Público |
| `POST` | `/api/servicios` | Crear servicio | Admin |
| `PUT` | `/api/servicios/{id}` | Actualizar servicio | Admin |
| `DELETE` | `/api/servicios/{id}` | Eliminar servicio | Admin |
| `POST` | `/api/reservas` | Crear reserva | Cliente |
| `GET` | `/api/reservas/mis-reservas` | Ver propias reservas | Cliente |
| `GET` | `/api/reservas` | Ver todas las reservas | Admin |
| `PATCH` | `/api/reservas/{id}/cancelar` | Cancelar reserva | Admin/Cliente |

---

## Tecnologías utilizadas

**Backend**
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA / Hibernate
- Base de datos H2 (en memoria)

**Frontend**
- Angular 17 (standalone components)
- TypeScript
- CSS personalizado

---

## Consola H2 (solo desarrollo)

Disponible en `http://localhost:8080/h2-console` mientras el backend esté corriendo.

- **JDBC URL:** `jdbc:h2:mem:hoteldb`
- **Usuario:** `sa`
- **Contraseña:** *(vacía)*
