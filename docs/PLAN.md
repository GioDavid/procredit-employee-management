# PLAN.md — Plan de implementación

> Deriva de `docs/SPEC.md`. Define **qué** se construye, en **qué orden** y **cómo se verifica** cada paso.
> Cada tarea referencia el requisito (`FR-*`) o criterio de aceptación (`AC-*`) de `docs/PROBLEM.md` que satisface.

## Orden de las fases

```
F1 Base de datos  →  F2 API .NET  →  F3 Frontend React  →  F4 Integración y entrega
```
La API depende del esquema y del SP; el frontend depende de los contratos de la API (ya congelados en `SPEC.md` §3, por lo que F2 y F3 pueden solaparse si hace falta).

---

## Fase 0 — Estructura del repositorio

| # | Tarea | Entregable |
|---|---|---|
| 0.1 | Crear carpetas `database/`, `backend/`, `frontend/` | Árbol del repo según README |
| 0.2 | `.gitignore` para .NET y Node | Artefactos de build fuera del control de versiones |
| 0.3 | Documentar en README cómo levantar cada capa | Instrucciones reproducibles |

---

## Fase 1 — Base de datos SQL Server (`database/`)

| # | Tarea | Cubre | Verificación |
|---|---|---|---|
| 1.1 | Script `01_create_database.sql` (BD `ProCreditRRHH`, collation `Latin1_General_CI_AI`) | FR-DB-01, D-02 | La BD se crea sin errores |
| 1.2 | Script `02_create_tables.sql`: `Departamento`, `Cargo`, `Empleado` con PK+IDENTITY, UNIQUE en nombres y en `NumeroDocumento`, CHECK de edad y remuneración | FR-DB-02, AC-01, AC-05 | `sp_help` muestra PKs e identities |
| 1.3 | FKs `Empleado → Departamento` y `Empleado → Cargo` + índices sobre esas columnas | FR-DB-03, AC-02 | Insertar con FK inexistente falla |
| 1.4 | Script `03_stored_procedures.sql`: `usp_Empleado_Consultar @Departamento NVARCHAR(100) = NULL` | FR-DB-04, AC-03, D-07 | Con `NULL` devuelve todos; con texto parcial filtra |
| 1.5 | Script `04_seed.sql`: 7 departamentos y 5 cargos del reto + empleados de ejemplo | AC-04 | Datos consultables desde el SP |
| 1.6 | Script `99_run_all.sql` que ejecuta los anteriores en orden | — | Reejecutable desde cero |

**Definición de hecho F1:** desde una instancia limpia de SQL Server, ejecutar `99_run_all.sql` deja la BD lista y `EXEC usp_Empleado_Consultar` devuelve filas con nombre de departamento y cargo resueltos. Renombrar un departamento con un `UPDATE` se refleja en todos sus empleados (AC-04).

---

## Fase 2 — API REST .NET 10 (`backend/`)

| # | Tarea | Cubre | Verificación |
|---|---|---|---|
| 2.1 | Solución con 4 proyectos: `ProCredit.Api`, `ProCredit.Application`, `ProCredit.Domain`, `ProCredit.Infrastructure` | FR-API (capas), AC-06 | `dotnet build` sin errores; dependencias solo en el sentido permitido (`SPEC.md` §3.1) |
| 2.2 | `Domain`: entidades `Empleado`, `Departamento`, `Cargo` | — | — |
| 2.3 | `Application`: DTOs (`EmpleadoDto`, `CrearEmpleadoRequest`, `LoginRequest/Response`), interfaces de repositorio y servicios de caso de uso con validaciones (`SPEC.md` §3.3) | AC-05 | Pruebas de validación |
| 2.4 | `Infrastructure`: repositorio SQL Server que invoca `usp_Empleado_Consultar` e inserta empleados; cadena de conexión por configuración | D-07 | Consulta e inserción reales contra la BD |
| 2.5 | `Infrastructure`: emisor de JWT HS256, expiración 60 min; usuario de prueba desde `appsettings` | FR-API-01, D-09, D-10 | Token válido y decodificable |
| 2.6 | `Api`: `POST /api/auth/login` (público) | FR-API-01, AC-07 | 200 con credenciales correctas, 401 con incorrectas |
| 2.7 | `Api`: `GET /api/empleados` y `GET /api/empleados?departamento=` | FR-API-02, FR-API-04, AC-08, AC-10 | Sin token → 401; con token → listado / filtrado parcial |
| 2.8 | `Api`: `POST /api/empleados` | FR-API-03, AC-09 | 201 + `Location`; 409 con documento duplicado; 400 con datos inválidos |
| 2.9 | `Api`: `GET /api/departamentos` y `GET /api/cargos` | `SPEC.md` §3.4 | Listas para los selects del modal |
| 2.10 | Middleware de errores `ProblemDetails` + CORS para el origen del frontend | `SPEC.md` §3.5 | Errores uniformes, sin fugas de detalles internos |
| 2.11 | Swagger/OpenAPI con soporte de Bearer para pruebas manuales | — | Endpoints ejercitables desde el navegador |

**Definición de hecho F2:** flujo completo verificable por HTTP: login → token → listar → buscar → crear → el nuevo empleado aparece en el listado.

---

## Fase 3 — Frontend React 19 (`frontend/`)

| # | Tarea | Cubre | Verificación |
|---|---|---|---|
| 3.1 | Proyecto React 19 (Vite + TypeScript) con librería de UI (`SPEC.md` D-13) | FR-UI, AC-15 | `npm run build` correcto |
| 3.2 | Cliente HTTP con inyección de `Authorization: Bearer` e interceptor de 401 → logout | `SPEC.md` §4.2 | Token expirado devuelve al login |
| 3.3 | Contexto de sesión + rutas privadas | `SPEC.md` §4.2 | Sin token no se accede al listado |
| 3.4 | Pantalla **P-01 Login** | FR-UI-01, AC-11 | Login con el usuario de prueba navega al listado; error muestra mensaje |
| 3.5 | Pantalla **P-02 Listado** en tabla, carga automática al montar | FR-UI-02, FR-UI-04, AC-12 | Al entrar se ven los empleados sin acción del usuario |
| 3.6 | Búsqueda por departamento (coincidencias) sobre P-02 | FR-UI-05, AC-14 | Texto parcial filtra; vacío restaura todo |
| 3.7 | **M-01 Modal** de registro con selects de departamento y cargo | FR-UI-03, AC-13 | Alta exitosa cierra el modal y refresca la tabla |
| 3.8 | Estados de carga, vacío y error en todas las vistas | — | Sin pantallas en blanco ante fallos |

**Definición de hecho F3:** con la API en marcha, un usuario hace login, ve la tabla cargada, busca por departamento y registra un empleado desde el modal.

---

## Fase 4 — Integración y entrega

| # | Tarea | Verificación |
|---|---|---|
| 4.1 | Prueba end-to-end del recorrido completo (login → listar → buscar → crear) | Todos los AC-01…AC-15 verificados |
| 4.2 | README de entrega: prerrequisitos, cómo crear la BD, cadena de conexión, credenciales del usuario de prueba, cómo correr API y frontend | Un tercero puede levantar el proyecto desde cero |
| 4.3 | Matriz final de trazabilidad AC → evidencia | Cada criterio con su comprobación |

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Disponibilidad de .NET 10 / React 19 en el entorno del evaluador | Documentar versiones exactas y prerrequisitos en el README |
| Instancia de SQL Server no disponible localmente | Documentar alternativa con contenedor Docker de SQL Server |
| Insensibilidad a acentos en la búsqueda depende de la collation | Fijar la collation en el script de creación (tarea 1.1) |
| D-01 (área = departamento) pendiente de confirmación del evaluador | Nombre del concepto aislado en la tabla catálogo; renombrar es un cambio localizado |
