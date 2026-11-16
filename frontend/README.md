# Frontend Angular — Andes Suites

Aplicación SPA construida con Angular 21 y componentes standalone.

La documentación completa del proyecto, la rúbrica y el guion de exposición están en [`../DOCUMENTACION_RUBRICA.md`](../DOCUMENTACION_RUBRICA.md).

## Ejecución

```bash
npm install
npm start
```

Disponible en `http://localhost:4200`.

El backend debe estar en `http://localhost:8080`. La URL se configura en `src/environments/environment.ts`.

## Estructura

```
src/app/
├── core/       Modelos, servicios, guards, interceptores y validadores
├── shared/     Navbar y notificaciones reutilizables
├── features/   Catálogo, autenticación, reservas y administración
├── app.routes.ts
└── app.config.ts
```

## Comandos útiles

```bash
npm run build                  # Compilación de producción
npx ng test --watch=false      # Pruebas unitarias
```

## Rutas protegidas

| Ruta | Guard | Acceso |
|---|---|---|
| `/mis-reservas` | `authGuard` | Sesión activa |
| `/admin` | `adminGuard` | Solo administrador |
| `/login`, `/registro` | `guestGuard` | Solo visitantes |
