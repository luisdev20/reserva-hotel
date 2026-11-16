# Documentación del proyecto y guía de exposición

**Proyecto:** Sistema de reservas del Hotel Andes Suites  
**Arquitectura:** Spring Boot REST API + Angular SPA  
**Base de datos:** H2 en memoria (configuración para MySQL incluida)  
**Seguridad:** Spring Security + JWT con roles `ADMIN` y `CLIENTE`

Este documento explica qué está implementado, cómo se relaciona con la rúbrica de la semana 15 y cómo sustentarlo en clase. Está pensado para estudiar el código y responder preguntas, no solo para copiar una demo.

---

## 1. Resumen de lo que hace el sistema

- Un visitante puede ver el catálogo de suites y servicios y filtrar por precio máximo.
- Un visitante puede registrarse como cliente o iniciar sesión.
- Un cliente autenticado puede reservar una suite indicando fechas y notas.
- El sistema valida que las fechas sean correctas y que no exista otra reserva activa en el mismo rango.
- El cliente puede ver y cancelar sus reservas.
- Un administrador puede ver indicadores, crear, editar y eliminar servicios, ver todas las reservas y ver todos los usuarios.
- Las rutas privadas están protegidas por guards en Angular y por reglas de rol en Spring Security.
- La interfaz es responsive y muestra estados de carga, error, vacío y confirmación.

---

## 2. Cómo ejecutar y probar

### Backend

```bash
cd reserva-hotel
./mvnw spring-boot:run
```

Queda en `http://localhost:8080`.

### Frontend

```bash
cd reserva-hotel/frontend
npm install
npm start
```

Queda en `http://localhost:4200`.

### Pruebas

```bash
./mvnw test
cd frontend
npx ng test --watch=false
```

Resultado esperado:

- Backend: 10 pruebas aprobadas.
- Frontend: 2 pruebas aprobadas.

### Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@andessuites.com` | `admin123` |
| Cliente | `cliente@andessuites.com` | `cliente123` |

---

## 3. Cumplimiento de la rúbrica

| Criterio | Puntos | Dónde se evidencia | Cómo se explica |
|---|---:|---|---|
| Arquitectura Angular y componentes | 4 | `frontend/src/app/core`, `shared`, `features`, `app.routes.ts`, `app.config.ts` | Separación por responsabilidades, componentes standalone, servicios inyectables, modelos tipados y lazy loading. |
| Navegación y rutas | 4 | `app.routes.ts`, `core/guards/auth.guard.ts`, `admin.guard.ts`, `guest.guard.ts`, `features/not-found` | Rutas públicas y privadas, guards por sesión y rol, retorno a la ruta intentada, 404 y títulos por página. |
| Formularios y validaciones | 4 | `features/auth/login`, `features/auth/registro`, `features/catalogo`, `features/admin` | Reactive Forms, validadores nativos, validadores personalizados, mensajes de error y bloqueo de envíos inválidos. |
| Consumo de API REST | 5 | `core/services`, `core/interceptors`, `environments/environment.ts` | HttpClient tipado, URL centralizada, interceptor JWT, interceptor de errores, estados de carga, reintento y manejo de 400/401/403/404/0. |
| Diseño UI/UX y responsive | 3 | `styles.css`, navbar, catálogo, tablas, modales y notificaciones | Sistema de diseño, menú móvil, grillas adaptables, tablas convertidas en tarjetas, accesibilidad y estados visuales. |

### Nota importante sobre “módulos” en Angular

La rúbrica menciona módulos, pero Angular 21 recomienda **componentes standalone** y ya no obliga a usar `NgModule`. En este proyecto la modularidad se logra así:

- `core/`: todo lo transversal (modelos, servicios, guards, interceptores, validadores).
- `shared/`: componentes reutilizables (navbar y notificaciones).
- `features/`: cada funcionalidad del negocio en su propia carpeta (catálogo, autenticación, reservas, admin).
- Cada feature se carga con `loadComponent`, es decir, funciona como un módulo lógico con carga diferida.

Si el docente pregunta por los módulos, la respuesta es: “La aplicación usa la arquitectura moderna de Angular con componentes standalone. La separación modular se mantiene a nivel de features y cada una se carga de forma diferida; no se fuerza un `NgModule` porque Angular 21 ya no lo requiere”.

---

## 4. Arquitectura del frontend

### 4.1 Estructura real

```
frontend/src/
├── environments/
│   └── environment.ts                  URL única de la API
├── app/
│   ├── core/
│   │   ├── models/models.ts            Interfaces TypeScript
│   │   ├── services/
│   │   │   ├── auth.service.ts         Login, registro, sesión y usuarios
│   │   │   ├── reserva.service.ts      Servicios, categorías y reservas
│   │   │   └── toast.service.ts        Notificaciones globales
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           Exige sesión
│   │   │   ├── admin.guard.ts          Exige rol ADMIN
│   │   │   └── guest.guard.ts          Bloquea login/registro si ya hay sesión
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts     Agrega el token JWT
│   │   │   └── error.interceptor.ts    Traduce errores HTTP
│   │   └── validators/
│   │       ├── date-range.validator.ts Valida fechas de reserva
│   │       └── password-match.validator.ts Valida confirmación de contraseña
│   ├── shared/
│   │   └── components/
│   │       ├── navbar/                 Navegación responsive
│   │       └── toast/                  Notificaciones
│   ├── features/
│   │   ├── auth/login/                 Inicio de sesión
│   │   ├── auth/registro/              Registro de cliente
│   │   ├── catalogo/                   Catálogo y modal de reserva
│   │   ├── reservas/                   Mis reservas
│   │   ├── admin/                      Panel administrativo
│   │   └── not-found/                  Página 404
│   ├── app.routes.ts                   Rutas y guards
│   ├── app.config.ts                   Providers globales
│   ├── app.ts                          Componente raíz
│   └── app.html                        Navbar + router-outlet + footer + toasts
└── styles.css                          Tokens, componentes base y responsive
```

### 4.2 Responsabilidades

- **Componente:** presenta la vista y reacciona a eventos. No debería saber cómo se construye una URL HTTP.
- **Servicio:** encapsula las llamadas HTTP y la lógica de sesión.
- **Modelo:** define contratos tipados (`Servicio`, `Reserva`, `AuthResponse`, etc.).
- **Guard:** decide si se puede activar una ruta.
- **Interceptor:** modifica todas las peticiones o respuestas de forma transversal.
- **Validador:** reutiliza reglas de formulario fuera del componente.

Esta separación es la que se explica como “arquitectura por capas” también en el frontend.

### 4.3 Signals

La sesión y el estado de las pantallas usan `signal` y `computed`:

```ts
private readonly _usuario = signal<AuthResponse | null>(this.leerUsuario());
readonly usuario = this._usuario.asReadonly();
readonly isLoggedIn = computed(() => this._usuario() !== null);
readonly isAdmin = computed(() => this._usuario()?.rol === 'ADMIN');
```

Ventajas para la exposición:

- La navbar reacciona automáticamente cuando cambia la sesión.
- Los guards leen el estado actual sin consultar el backend.
- No se depende de `ChangeDetectorRef` para refrescar la vista.

---

## 5. Navegación y rutas protegidas

### 5.1 Tabla de rutas

| Ruta | Componente | Guard | Acceso |
|---|---|---|---|
| `/` | `CatalogoComponent` | Ninguno | Público |
| `/login` | `LoginComponent` | `guestGuard` | Solo visitantes |
| `/registro` | `RegistroComponent` | `guestGuard` | Solo visitantes |
| `/mis-reservas` | `MisReservasComponent` | `authGuard` | Sesión activa |
| `/admin` | `AdminComponent` | `adminGuard` | Solo `ADMIN` |
| `/no-encontrado` | `NotFoundComponent` | Ninguno | Público |
| `**` | Redirección | Ninguno | Redirige a 404 |

### 5.2 Lazy loading

Cada ruta usa `loadComponent`:

```ts
{
  path: 'admin',
  title: 'Panel administrativo | Andes Suites',
  canActivate: [adminGuard],
  loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent)
}
```

Esto genera chunks separados en el build. En la exposición se puede mostrar la salida de `npm run build` y señalar `admin-component`, `catalogo-component`, `login-component`, etc.

### 5.3 Guards

**authGuard:** si no hay sesión, redirige al login y guarda la ruta intentada.

```ts
return router.createUrlTree(['/login'], {
  queryParams: { returnUrl: state.url }
});
```

**adminGuard:** si no hay sesión, va al login; si hay sesión pero el rol no es `ADMIN`, va al catálogo.

**guestGuard:** si el usuario ya inició sesión, no lo deja volver a `/login` ni `/registro`; lo envía a `/admin` o `/` según su rol.

### 5.4 Retorno después del login

El login lee `returnUrl`:

```ts
const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
const destino = returnUrl ?? (respuesta.rol === 'ADMIN' ? '/admin' : '/');
this.router.navigateByUrl(destino);
```

Flujo demostrable:

1. Sin sesión, entrar a `/mis-reservas`.
2. El guard redirige a `/login?returnUrl=/mis-reservas`.
3. Iniciar sesión.
4. La aplicación vuelve automáticamente a `/mis-reservas`.

### 5.5 Página 404

La ruta comodín `**` redirige a `/no-encontrado`. Antes redirigía al inicio; ahora el usuario sabe que la ruta no existe.

### 5.6 Títulos y scroll

- Cada ruta define un `title` que aparece en la pestaña del navegador.
- `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` vuelve arriba al navegar.

---

## 6. Formularios reactivos y validaciones

### 6.1 Formularios implementados

| Pantalla | Formulario | Archivo |
|---|---|---|
| Login | Correo y contraseña | `features/auth/login/login.component.ts` |
| Registro | Datos personales, contraseña, confirmación y términos | `features/auth/registro/registro.component.ts` |
| Catálogo | Filtro por precio | `features/catalogo/catalogo.component.ts` |
| Catálogo | Reserva de suite | `features/catalogo/catalogo.component.ts` |
| Admin | Crear/editar servicio | `features/admin/admin.component.ts` |

Todos usan `ReactiveFormsModule` y `FormBuilder`. No se usa `ngModel` en los formularios del proyecto.

### 6.2 Validadores usados

**Login**

- `required`
- `email`
- `minLength(6)` en contraseña

**Registro**

- `required`
- `minLength(2)` en nombre
- `pattern` para aceptar solo letras y espacios
- `email`
- `pattern` de 9 dígitos para teléfono
- `minLength(6)` en contraseña
- `requiredTrue` para aceptar términos
- Validador personalizado `passwordsIgualesValidator`

**Reserva**

- `required` en fechas
- `maxLength(250)` en notas
- Validador personalizado `rangoFechasValidator`
- Atributos `min` en los inputs de fecha para guiar al usuario

**Admin**

- `required`
- `minLength` y `maxLength` en nombre y descripción
- `min(1)` en precio
- `min(1)` y `max(12)` en capacidad
- `min(1)` en categoría

### 6.3 Validador personalizado de fechas

Archivo: `core/validators/date-range.validator.ts`.

```ts
export const rangoFechasValidator: ValidatorFn = (group) => {
  const entrada = group.get('fechaEntrada')?.value;
  const salida = group.get('fechaSalida')?.value;

  if (!entrada || !salida) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaEntrada = new Date(`${entrada}T00:00:00`);
  const fechaSalida = new Date(`${salida}T00:00:00`);

  if (fechaEntrada.getTime() < hoy.getTime()) return { fechaPasada: true };
  if (fechaSalida.getTime() <= fechaEntrada.getTime()) return { rangoInvalido: true };

  return null;
};
```

Se aplica al grupo porque necesita comparar dos controles:

```ts
readonly reservaForm = this.fb.nonNullable.group(
  {
    fechaEntrada: ['', [Validators.required]],
    fechaSalida: ['', [Validators.required]],
    notas: ['', [Validators.maxLength(250)]]
  },
  { validators: rangoFechasValidator }
);
```

### 6.4 Cómo se muestran los errores

Patrón usado en todos los formularios:

```html
@if (email.invalid && (email.touched || enviado)) {
  <p class="field-error">Ingresa un correo válido.</p>
}
```

- `touched`: el usuario ya interactuó con el campo.
- `enviado`: el usuario intentó enviar, aunque no haya tocado el campo.
- Al enviar un formulario inválido se ejecuta `markAllAsTouched()` para mostrar todos los errores.
- El CSS global marca los controles inválidos con borde rojo mediante `.ng-invalid.ng-touched`.

### 6.5 Cálculo en vivo del total

En el modal de reserva:

```ts
const diferencia = Math.round((salida.getTime() - entrada.getTime()) / 86400000);

if (diferencia > 0 && servicio) {
  this.noches.set(diferencia);
  this.totalEstimado.set(diferencia * servicio.precio);
}
```

El usuario ve noches y total antes de confirmar. El backend vuelve a calcular el total; nunca se confía en el precio enviado por el navegador.

### 6.6 Doble validación

- **Frontend:** valida para dar retroalimentación rápida y evitar peticiones innecesarias.
- **Backend:** valida con Bean Validation y reglas de negocio porque cualquiera puede saltarse el frontend.
- **Base de datos:** conserva integridad referencial con claves foráneas.

Esta doble validación es una respuesta sólida a la pregunta “¿por qué validar dos veces?”.

---

## 7. Consumo de la API REST

### 7.1 URL centralizada

`frontend/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Los servicios usan `environment.apiUrl`. Si cambia el puerto o el dominio, se modifica un solo archivo.

### 7.2 Servicios tipados

`core/services/auth.service.ts` y `core/services/reserva.service.ts` encapsulan todas las llamadas:

```ts
crearReserva(reserva: CrearReservaRequest): Observable<Reserva> {
  return this.http.post<Reserva>(`${this.apiUrl}/reservas`, reserva);
}

buscarPorPrecioMax(precioMax: number): Observable<Servicio[]> {
  return this.http.get<Servicio[]>(`${this.apiUrl}/servicios/buscar`, {
    params: { precioMax }
  });
}
```

Los modelos están en `core/models/models.ts`. Esto evita `any` y permite que TypeScript detecte errores en tiempo de compilación.

### 7.3 Interceptor JWT

`core/interceptors/auth.interceptor.ts` agrega el token a todas las peticiones protegidas:

```ts
const token = authService.getToken();

if (!token || esRutaPublica) {
  return next(req);
}

return next(req.clone({
  setHeaders: { Authorization: `Bearer ${token}` }
}));
```

Ventaja: ningún componente repite la cabecera `Authorization`.

### 7.4 Interceptor de errores

`core/interceptors/error.interceptor.ts` transforma `HttpErrorResponse` en un `Error` con mensaje legible:

- `status 0`: backend apagado o sin conexión.
- `400`: error de validación o regla de negocio.
- `401`: sesión ausente o expirada; cierra sesión y redirige al login.
- `403`: el usuario no tiene permisos.
- `404`: recurso no encontrado.
- `409`: conflicto de negocio, por ejemplo, eliminar una suite con reservas.
- `500`: mensaje genérico.

El backend responde siempre con la propiedad `error`:

```json
{ "error": "La suite ya está reservada en el rango de fechas seleccionado. Elige otras fechas." }
```

Así el frontend no necesita adivinar la estructura de cada error.

### 7.5 Estados de interfaz

Cada pantalla que consume la API maneja:

- **Cargando:** spinner y texto.
- **Error:** alerta con botón “Reintentar”.
- **Vacío:** mensaje y acción sugerida.
- **Éxito:** notificación tipo toast o mensaje de confirmación.

Esto se puede mostrar en clase apagando el backend: el catálogo muestra “No se pudo conectar con el servidor” y permite reintentar.

### 7.6 Peticiones en paralelo

El panel administrativo usa `forkJoin` para cargar servicios, reservas, usuarios y categorías al mismo tiempo:

```ts
forkJoin({
  servicios: this.reservaService.getServicios(),
  reservas: this.reservaService.getTodasReservas(),
  usuarios: this.authService.listarUsuarios(),
  categorias: this.reservaService.getCategorias()
}).subscribe({ next: ({ servicios, reservas, usuarios, categorias }) => { ... } });
```

Ventaja: una sola suscripción y menor tiempo total de carga.

---

## 8. Diseño UI/UX y responsive

### 8.1 Sistema de diseño

`styles.css` define variables reutilizables:

```css
:root {
  --night: #1b2430;
  --cream: #f5f1e8;
  --gold: #c9a66b;
  --wine: #6e2a2e;
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'Work Sans', Arial, sans-serif;
}
```

La paleta busca evocar la cordillera y la hotelería de montaña. La tipografía combina una serif editorial para títulos con una sans para lectura.

### 8.2 Responsive

Puntos de quiebre principales:

- **900 px:** la navbar cambia a menú hamburguesa.
- **780 px:** grillas de dos columnas pasan a una; las tablas se convierten en tarjetas.
- **640 px:** filtros y resumen de reserva se apilan.
- **520 px:** tarjetas y botones se adaptan al ancho del móvil.

La navbar usa un botón con `aria-expanded` y cierra el menú al navegar.

### 8.3 Tablas convertidas en tarjetas

En móvil, cada fila se muestra como una tarjeta y cada celda usa `data-label`:

```html
<td data-label="Total"><strong>S/ {{ reserva.total }}</strong></td>
```

El CSS muestra la etiqueta con `::before`. Así no hay que hacer scroll horizontal para leer una reserva.

### 8.4 Accesibilidad

- Enlace “Saltar al contenido principal”.
- `aria-label` en botones de icono.
- `aria-modal` y `role="dialog"` en modales.
- `aria-live` en notificaciones.
- `focus-visible` con contorno dorado.
- `prefers-reduced-motion` para reducir animaciones.
- Formularios con `label for` y `id` en cada control.

### 8.5 Notificaciones

`ToastService` mantiene una lista de notificaciones con signals. `ToastComponent` las muestra y las elimina automáticamente. Se usa para confirmar reservas, cancelaciones y operaciones del admin.

---

## 9. Lógica esencial del backend

### 9.1 Capas

```
Controller -> Service -> Repository -> Base de datos
                |
                +-> DTOs de entrada y salida
```

- **Controller:** recibe HTTP, valida con `@Valid` y devuelve códigos correctos.
- **Service:** aplica reglas de negocio.
- **Repository:** consultas JPA y JPQL.
- **DTO:** evita exponer entidades y contraseñas.
- **Exception handler:** unifica errores de validación.

### 9.2 Seguridad

- `SecurityConfig` define rutas públicas y privadas.
- `JwtAuthenticationFilter` lee el encabezado `Authorization: Bearer ...`.
- `JwtUtil` genera y valida el token.
- Las contraseñas se guardan con BCrypt.
- Los roles se usan como `ROLE_ADMIN` y `ROLE_CLIENTE`.
- El registro público siempre crea usuarios `CLIENTE`; aunque un cliente malicioso envíe `"rol":"ADMIN"`, el backend lo ignora.
- `401` y `403` se devuelven en JSON.

Flujo de login:

```
Angular -> POST /api/auth/login
        <- token JWT + datos del usuario
Angular guarda token y usuario
Interceptor agrega Authorization en cada petición
Backend valida token y rol
```

### 9.3 Prevención de sobreventa

Este es el punto más importante de la lógica agregada.

Dos reservas se cruzan si:

```sql
r.fechaEntrada < :fechaSalidaNueva
AND r.fechaSalida > :fechaEntradaNueva
```

En JPQL:

```java
@Query("""
    SELECT COUNT(r) FROM Reserva r
    WHERE r.servicio.id = :servicioId
      AND r.estado <> 'CANCELADA'
      AND r.fechaEntrada < :fechaSalida
      AND r.fechaSalida > :fechaEntrada
    """)
long contarReservasSolapadas(...);
```

Ejemplos:

```
Reserva existente: 19 --- 22
Nueva reserva:     20 --- 21   -> hay cruce, se rechaza
Nueva reserva:     18 --- 19   -> no hay cruce, se acepta
Nueva reserva:     22 --- 24   -> no hay cruce, se acepta (check-out = check-in)
```

La condición usa `<` y `>` (no `<=` ni `>=`) para permitir que una suite se ocupe el mismo día en que otra reserva termina.

Si hay cruce, el backend responde `400`:

```json
{ "error": "La suite ya está reservada en el rango de fechas seleccionado. Elige otras fechas." }
```

El frontend muestra ese mensaje dentro del modal, sin cerrarlo, para que el usuario cambie las fechas.

### 9.4 Otras reglas de negocio

- La entrada no puede ser anterior a hoy.
- La salida debe ser posterior a la entrada.
- La suite debe estar marcada como disponible.
- El total se calcula con `ChronoUnit.DAYS.between(...)`.
- Cancelar una reserva cambia el estado a `CANCELADA`.
- Una reserva cancelada ya no bloquea fechas.
- No se puede cancelar dos veces.
- Un cliente solo puede cancelar sus propias reservas; el admin puede cancelar cualquiera.
- No se elimina una suite que ya tiene reservas asociadas; se recomienda marcarla como “No disponible”. El backend responde `409 Conflict` con un mensaje claro.

### 9.5 Consultas JPQL

- Servicios disponibles por precio máximo.
- Búsqueda por término en nombre o descripción.
- Reservas por email de usuario.
- Reservas por estado.
- Conteo de reservas solapadas.

Estas consultas se explican como evidencia de persistencia y consultas personalizadas.

### 9.6 DTOs

- `LoginRequestDTO` y `RegisterRequestDTO`: entrada de autenticación.
- `AuthResponseDTO`: token y datos seguros del usuario.
- `ServicioDTO`: entrada/salida de servicios.
- `ReservaDTO`: solicitud de reserva.
- `ReservaResponseDTO`: reserva con nombres y datos calculados.
- `UsuarioResponseDTO`: usuario sin contraseña.

---

## 10. Flujo completo de una reserva

```
1. El usuario entra al catálogo.
2. Angular llama GET /api/servicios.
3. El usuario pulsa "Reservar".
4. Si no hay sesión, el router lo envía a /login?returnUrl=/.
5. Al iniciar sesión, vuelve al catálogo.
6. El modal abre un formulario reactivo con fechas sugeridas.
7. El usuario cambia fechas; Angular calcula noches y total estimado.
8. Al confirmar, Angular envía POST /api/reservas con el token JWT.
9. Spring Security valida el token.
10. El controller valida el DTO.
11. El service valida fechas, disponibilidad y solapamiento.
12. Si todo está correcto, guarda la reserva y responde 201.
13. Angular muestra un toast con el número de reserva y el total.
14. La reserva aparece en /mis-reservas.
```

---

## 11. Guion de exposición sugerido (10 a 12 minutos)

### Minuto 0 a 1: contexto

“Andes Suites es un sistema de reservas para un hotel de montaña. El problema principal es evitar la sobreventa y permitir que el cliente gestione sus reservas sin intervención manual.”

### Minuto 1 a 3: arquitectura

Mostrar el árbol de carpetas del frontend y explicar `core`, `shared` y `features`. Mencionar que Angular 21 usa componentes standalone y lazy loading.

### Minuto 3 a 5: rutas y seguridad

Mostrar `app.routes.ts` y los tres guards. Hacer la demo:

1. Sin sesión, entrar a `/mis-reservas`.
2. Ver la redirección con `returnUrl`.
3. Iniciar sesión y volver.

Luego entrar como cliente a `/admin` y mostrar que redirige al catálogo.

### Minuto 5 a 7: formularios

Abrir el modal de reserva. Mostrar:

- Fecha de salida anterior a la entrada: error.
- Fecha pasada: error.
- Cálculo automático de noches y total.
- Botón deshabilitado mientras envía.

Mostrar también el formulario de registro con confirmación de contraseña y términos.

### Minuto 7 a 9: consumo REST y backend

Mostrar el catálogo con datos reales. Filtrar por precio. Luego intentar reservar la Suite Andina en un rango que se cruce con la reserva precargada y mostrar el error 400 con el mensaje de solapamiento.

Explicar el interceptor JWT y el interceptor de errores. Si se apaga el backend, mostrar el mensaje de conexión y el botón “Reintentar”.

### Minuto 9 a 11: panel admin

Iniciar sesión como administrador. Mostrar:

- KPIs calculados.
- Crear un servicio.
- Editarlo.
- Ver reservas y usuarios.
- Cancelar una reserva.

### Minuto 11 a 12: responsive y cierre

Abrir las herramientas del navegador y cambiar a vista móvil. Mostrar el menú hamburguesa y las tablas convertidas en tarjetas. Cerrar con las mejoras futuras: refresh tokens, cookies httpOnly, paginación, correo de confirmación y pasarela de pago.

---

## 12. Preguntas probables del jurado

### ¿Por qué usaste componentes standalone y no módulos?

Porque Angular 21 los recomienda y reducen el boilerplate. La modularidad se conserva con carpetas por feature y lazy loading. Cada feature se carga solo cuando se necesita.

### ¿Dónde se guarda el token y cómo se envía?

Se guarda en `localStorage` y un interceptor lo agrega como `Authorization: Bearer` en cada petición. Para producción se recomendaría una cookie `httpOnly` para reducir el riesgo de XSS.

### ¿Cómo evitas que dos personas reserven la misma suite?

El backend ejecuta una consulta de conteo que busca reservas activas del mismo servicio cuyo rango se cruce con el nuevo. Si el conteo es mayor que cero, responde `400` y no guarda nada. No basta con validar en el frontend porque el frontend puede saltarse.

### ¿Por qué permites reservas consecutivas el mismo día?

Porque el check-out y el check-in pueden ocurrir el mismo día. La condición usa `<` y `>` para no considerar cruce cuando una reserva termina justo cuando empieza la otra.

### ¿Qué diferencia hay entre autenticación y autorización?

La autenticación verifica quién es el usuario (login y JWT). La autorización decide qué puede hacer (roles en `SecurityConfig` y guards en Angular).

### ¿Para qué sirven los guards si el backend ya protege?

Los guards mejoran la experiencia: evitan mostrar pantallas que el usuario no puede usar y redirigen antes de hacer peticiones innecesarias. La seguridad real sigue estando en el backend.

### ¿Cómo manejas los errores de la API?

El backend devuelve JSON con `error`. El interceptor de errores convierte la respuesta en un `Error` con mensaje legible. Cada pantalla muestra el error en un alert o toast y ofrece reintentar cuando corresponde.

### ¿Qué pasa si el token expira?

El interceptor detecta `401`, cierra la sesión, redirige al login y guarda la ruta actual para volver después de autenticarse.

### ¿Cómo se calcula el total?

En el backend, con la diferencia de días entre entrada y salida multiplicada por el precio de la suite. El frontend muestra un estimado, pero el valor oficial es el del backend.

### ¿Qué pasa al cancelar una reserva?

Se cambia el estado a `CANCELADA`. La consulta de solapamiento excluye las canceladas, por lo que las fechas quedan libres nuevamente.

### ¿Qué pasa si el administrador intenta eliminar una suite con reservas?

El backend lo bloquea con `409 Conflict` para no romper el historial. La alternativa correcta es marcarla como “No disponible”, lo que impide nuevas reservas sin borrar las existentes.

### ¿Puede un usuario registrarse como administrador enviando un rol distinto?

No. El endpoint público de registro ignora el rol enviado y siempre crea un usuario `CLIENTE`. Los administradores solo se crean desde la carga inicial o un proceso interno.

### ¿Por qué H2 y no MySQL?

H2 permite que el proyecto se ejecute sin instalar un motor de base de datos, ideal para la demostración. La configuración para MySQL ya está comentada en `application.properties`.

### ¿Qué mejorarías?

- Cookies `httpOnly` y refresh tokens.
- Paginación y búsqueda avanzada.
- Correos de confirmación.
- Pasarela de pago.
- Pruebas unitarias de componentes y servicios.
- Migración a MySQL/PostgreSQL con migraciones Flyway.
- Imágenes reales de las suites.

---

## 13. Commits agrupados por funcionalidad

El repositorio está organizado con commits por feature, con mensajes breves en español:

1. `feat(backend): valida solapamiento y fechas de reservas`
2. `feat(frontend): estructura por features, guards e interceptor JWT`
3. `feat(auth): formularios reactivos con validaciones`
4. `feat(reservas): formulario reactivo con validacion de fechas`
5. `feat(admin): formulario reactivo para gestionar servicios`
6. `feat(reservas): mejora panel de mis reservas con resumen y estados`
7. `fix(frontend): sesion segura sin localStorage y prueba base`
8. `fix(backend): respuestas 401 y 403 en formato JSON`
9. `feat(ui): mejora metadatos y accesibilidad del shell`
10. `docs: documenta arquitectura y rubrica de evaluacion`
11. `fix(backend): protege registro y eliminacion de servicios`

---

## 14. Problemas frecuentes

### El frontend no carga datos

Verificar que el backend esté en `http://localhost:8080`. Si está apagado, el catálogo muestra un mensaje de conexión.

### Error 401 o 403

- `401`: no hay token o expiró. Volver a iniciar sesión.
- `403`: el usuario no tiene el rol necesario. Probar con la cuenta administrador.

### El puerto está ocupado

- Backend: cambiar `server.port` en `application.properties`.
- Frontend: `npm start -- --port 4300`.
- Si cambia el puerto del backend, actualizar `environment.ts`.

### Los datos desaparecen al reiniciar

Es esperado: H2 está en memoria. Cada reinicio vuelve a ejecutar `DataInitializer`.

### Las fechas de la reserva precargada cambian

`DataInitializer` usa `LocalDate.now().plusDays(3)` y `plusDays(6)`. Por eso la reserva de ejemplo siempre está en el futuro y sirve para demostrar el solapamiento.

---

## 15. Checklist antes de la exposición

- [ ] Backend ejecutándose en el puerto 8080.
- [ ] Frontend ejecutándose en el puerto 4200.
- [ ] Haber iniciado sesión con ambas cuentas al menos una vez.
- [ ] Tener identificada la reserva precargada de la Suite Andina.
- [ ] Probar el flujo de reserva y cancelación.
- [ ] Probar el error de solapamiento.
- [ ] Probar el acceso a `/admin` con un cliente.
- [ ] Probar la vista móvil.
- [ ] Tener abierto este documento y el README.
- [ ] Tener a mano las credenciales de prueba.
