# Frontend — React 19 + Material UI

SPA de gestión de empleados (Fase 3 de `docs/PLAN.md`). Consume la API de `../backend`.

## Requisitos

- Node 20.19+ o 22+
- API en ejecución (ver `../backend/README.md`) y base de datos creada (`../database/README.md`)

## Ejecutar

```bash
cd frontend
npm install
cp .env.example .env      # ajusta VITE_API_BASE_URL si la API no está en http://localhost:5080
npm run dev               # http://localhost:5173
```

Otros comandos: `npm run build` (typecheck + bundle) y `npm run lint`.

> La API sólo permite CORS desde `http://localhost:5173` (`Cors:OrigenesPermitidos` en `appsettings.json`).

## Estructura

| Ruta | Contenido |
|---|---|
| `src/api/client.ts` | `fetch` con `Authorization: Bearer`, traducción de `ProblemDetails` y disparo de logout ante 401 |
| `src/api/empleados.ts` | Llamadas a login, empleados y catálogos |
| `src/auth/` | Contexto de sesión (token en `localStorage`), hook `useAuth` y `RutaPrivada` |
| `src/pages/LoginPage.tsx` | P-01 Login |
| `src/pages/EmpleadosPage.tsx` | P-02 Listado con carga automática y búsqueda por departamento |
| `src/pages/NuevoEmpleadoDialog.tsx` | M-01 Modal de registro |

## Pantallas

- **P-01 Login**: usuario y clave del usuario de prueba configurado en la API; error `401` muestra "Credenciales inválidas".
- **P-02 Listado**: llama a `GET /api/empleados` al montar; la búsqueda por departamento consulta `?departamento=` con debounce y el campo vacío restaura el listado completo.
- **M-01 Modal**: valida en cliente las mismas reglas que la API, muestra el mensaje del servidor (p. ej. documento duplicado) y al guardar cierra, notifica y refresca la tabla.
