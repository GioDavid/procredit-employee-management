# SPEC.md — Especificación funcional y técnica

> Deriva de `docs/PROBLEM.md` (fuente de verdad: `Prueba_Desarrollador_FullStack_Digital_v1.1.pdf`).
> Este documento **especifica** el sistema (contratos, modelo de datos, pantallas). No es implementación.
>
> Convención:
> - **[EXPLÍCITO]** = exigido por el reto.
> - **[DECISIÓN]** = decisión de diseño tomada aquí para cerrar una ambigüedad de `PROBLEM.md` (sección 10).
> - **[FUERA DE ALCANCE]** = no se implementa.

---

## 0. Decisiones que cierran ambigüedades

| # | Ambigüedad (PROBLEM.md §10) | Decisión |
|---|---|---|
| D-01 | "Área" vs "departamento" | **Son el mismo concepto.** Entidad única llamada `Departamento` en la BD/API; la UI y los mensajes de negocio pueden mostrar "Área/Departamento". |
| D-02 | Búsqueda "filtrada" (API) vs "por coincidencias" (UI) | Un solo endpoint de búsqueda por **coincidencia parcial** del *nombre* del departamento (`LIKE '%texto%'`), **insensible a mayúsculas y acentos** (collation `Latin1_General_CI_AI`). |
| D-03 | Atributos del Empleado | Solo los mencionados en el reto: documento de identidad, nombres, apellidos, edad, remuneración mensual, departamento, cargo. Nada adicional. |
| D-04 | Edad vs fecha de nacimiento | Se **almacena la edad** como entero (el reto pide "edad"). Sin fecha de nacimiento. |
| D-05 | Remuneración mensual | `DECIMAL(18,2)`, sin moneda explícita (moneda única implícita). Visible para todo usuario autenticado. |
| D-06 | Reportes de Nómina | **[FUERA DE ALCANCE]**: son motivación de negocio; el reto no pide servicios ni pantallas de reportes. El modelo los habilita (remuneración por empleado y por departamento). |
| D-07 | Alcance del Stored Procedure | **Un solo SP** `usp_Empleado_Consultar` con parámetro opcional de departamento: resuelve tanto el listado completo como la búsqueda filtrada. Ambos endpoints de consulta lo consumen. |
| D-08 | ABM de departamentos y cargos | **[FUERA DE ALCANCE]** como servicios/pantallas. Se entregan **precargados** vía datos semilla; el requisito de "renombrar una sola vez" queda satisfecho por la normalización (un `UPDATE` en la tabla catálogo). |
| D-09 | Usuario de prueba | Definido en configuración de la aplicación (`appsettings`), no en tabla de usuarios. Sin gestión de usuarios ni roles. |
| D-10 | Bearer Token | **JWT** firmado HS256, emitido por la propia API, expiración 60 minutos, sin refresh token. |
| D-11 | Alcance CRUD | Solo **listar, buscar y agregar**. Sin edición ni eliminación. |
| D-12 | Paginación | Sin paginación en la API (el reto pide "todos los empleados"); el filtrado/orden visual queda en el cliente. |
| D-13 | Librería de UI | React 19 + una librería de componentes (p. ej. Material UI o Ant Design) para tabla, modal y formularios. |

---

## 1. Alcance

**Dentro:** base de datos SQL Server normalizada, API REST .NET 10 en capas con autenticación JWT, SPA React 19 con login, tabla de empleados, alta en modal y búsqueda por departamento.

**Fuera:** reportes de nómina, ABM de catálogos, edición/borrado de empleados, gestión de usuarios/roles, refresh token, paginación, internacionalización.

---

## 2. Modelo de datos (SQL Server) — **[EXPLÍCITO]** PK+identity, FK, 1 SP

### 2.1 `Departamento`

| Columna | Tipo | Restricciones |
|---|---|---|
| `DepartamentoId` | `INT IDENTITY(1,1)` | PK |
| `Nombre` | `NVARCHAR(100)` | NOT NULL, UNIQUE |

Semilla **[EXPLÍCITO]** (áreas nombradas en el reto): Recursos Humanos, Finanzas, Contabilidad, Marketing, Sistemas, Banca Empresas, Banca Personas.

### 2.2 `Cargo`

| Columna | Tipo | Restricciones |
|---|---|---|
| `CargoId` | `INT IDENTITY(1,1)` | PK |
| `Nombre` | `NVARCHAR(100)` | NOT NULL, UNIQUE |

Semilla **[EXPLÍCITO]** (cargos citados): Analista de Recursos Humanos, Contador Senior, Supervisor de Créditos, Diseñador UX/UI, Especialista de Sistemas.

### 2.3 `Empleado`

| Columna | Tipo | Restricciones |
|---|---|---|
| `EmpleadoId` | `INT IDENTITY(1,1)` | PK |
| `NumeroDocumento` | `VARCHAR(20)` | NOT NULL, **UNIQUE** (identificador único de negocio) |
| `Nombres` | `NVARCHAR(100)` | NOT NULL |
| `Apellidos` | `NVARCHAR(100)` | NOT NULL |
| `Edad` | `INT` | NOT NULL, CHECK `BETWEEN 18 AND 100` |
| `RemuneracionMensual` | `DECIMAL(18,2)` | NOT NULL, CHECK `>= 0` |
| `DepartamentoId` | `INT` | NOT NULL, FK → `Departamento` |
| `CargoId` | `INT` | NOT NULL, FK → `Cargo` |

Índices no únicos sobre `DepartamentoId` y `CargoId` para las consultas de filtrado.

### 2.4 Reglas del modelo

- Empleado 1 — 1 Departamento; Departamento 1 — N Empleados **[EXPLÍCITO]**.
- Empleado 1 — 1 Cargo; Cargo 1 — N Empleados **[EXPLÍCITO]**.
- Nombres de departamento y cargo viven **solo** en sus tablas catálogo: renombrar = un `UPDATE` reflejado en todos los empleados **[EXPLÍCITO]**.
- FKs sin borrado en cascada (no hay borrado en el alcance).

### 2.5 Stored Procedure **[EXPLÍCITO]**

`usp_Empleado_Consultar @Departamento NVARCHAR(100) = NULL`

- Devuelve: `EmpleadoId, NumeroDocumento, Nombres, Apellidos, Edad, RemuneracionMensual, DepartamentoId, Departamento (nombre), CargoId, Cargo (nombre)`.
- Si `@Departamento` es `NULL` o vacío → todos los empleados.
- Si viene con valor → filtra por coincidencia parcial insensible a mayúsculas/acentos sobre `Departamento.Nombre`.
- Orden por `Apellidos, Nombres`.

---

## 3. API REST (C# / .NET 10, arquitectura en capas) — **[EXPLÍCITO]**

### 3.1 Capas

| Capa | Responsabilidad |
|---|---|
| `Api` | Controllers, configuración de autenticación, manejo de errores, DI. |
| `Application` | Servicios de caso de uso, DTOs, validaciones. |
| `Domain` | Entidades y reglas de negocio. |
| `Infrastructure` | Acceso a datos SQL Server (invocación del SP e inserción), emisión de JWT. |

Regla de dependencia: `Api → Application → Domain`; `Infrastructure` implementa interfaces declaradas en `Application`/`Domain`.

### 3.2 Autenticación **[EXPLÍCITO]**

`POST /api/auth/login` — público.

Request:
```
{ "usuario": "string", "clave": "string" }
```
Response `200`:
```
{ "token": "<jwt>", "expiraEn": "2026-01-01T12:00:00Z" }
```
- `401` si las credenciales no coinciden con el **usuario de prueba preconfigurado** (`appsettings`).
- Todos los demás endpoints exigen `Authorization: Bearer <jwt>`; sin token o token inválido → `401`.

### 3.3 Empleados

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/empleados` | Listado de **todos** los empleados **[EXPLÍCITO]** | Bearer |
| `GET` | `/api/empleados?departamento={texto}` | Búsqueda filtrada por departamento (coincidencia parcial) **[EXPLÍCITO]** | Bearer |
| `POST` | `/api/empleados` | Agregar nuevo empleado **[EXPLÍCITO]** | Bearer |

Ambos `GET` se resuelven con `usp_Empleado_Consultar` (D-07).

`EmpleadoDto` (respuesta):
```
{
  "empleadoId": 1,
  "numeroDocumento": "12345678",
  "nombres": "Ana María",
  "apellidos": "Pérez Rojas",
  "edad": 34,
  "remuneracionMensual": 4500.00,
  "departamentoId": 1,
  "departamento": "Recursos Humanos",
  "cargoId": 1,
  "cargo": "Analista de Recursos Humanos"
}
```

`CrearEmpleadoRequest`:
```
{
  "numeroDocumento": "12345678",
  "nombres": "Ana María",
  "apellidos": "Pérez Rojas",
  "edad": 34,
  "remuneracionMensual": 4500.00,
  "departamentoId": 1,
  "cargoId": 1
}
```
Respuesta `201 Created` con `EmpleadoDto` y cabecera `Location`.

Validaciones del alta:
- Todos los campos requeridos.
- `numeroDocumento`: 6–20 caracteres, único → `409 Conflict` si ya existe.
- `edad`: 18–100.
- `remuneracionMensual`: > 0.
- `departamentoId` / `cargoId` deben existir → `400` si no.

### 3.4 Catálogos (soporte al formulario de alta)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/departamentos` | Lista `{ id, nombre }` para poblar el combo del modal | Bearer |
| `GET` | `/api/cargos` | Lista `{ id, nombre }` para poblar el combo del modal | Bearer |

**[DECISIÓN]** No están en el enunciado, pero son necesarios para que el formulario de alta envíe `departamentoId`/`cargoId` válidos (sin ellos no se puede cumplir FR-UI-03 con el modelo normalizado).

### 3.5 Errores

Formato uniforme (`ProblemDetails`): `400` validación, `401` no autenticado, `404` recurso inexistente, `409` documento duplicado, `500` error inesperado. Nunca se exponen detalles internos ni cadenas de conexión.

---

## 4. Frontend (React 19 + librería de UI) — **[EXPLÍCITO]**

### 4.1 Pantallas

**P-01 Login** (FR-UI-01)
- Campos usuario y clave, botón "Ingresar", estados de carga y error.
- Éxito → guarda el token y navega a P-02. Error → mensaje "Credenciales inválidas".

**P-02 Listado de empleados** (FR-UI-02, FR-UI-04, FR-UI-05)
- Al montar la pantalla se invoca `GET /api/empleados` automáticamente **[EXPLÍCITO]**.
- Tabla con columnas: Documento, Nombres, Apellidos, Edad, Departamento, Cargo, Remuneración mensual.
- Campo de búsqueda por departamento → `GET /api/empleados?departamento={texto}`; vacío restaura el listado completo.
- Botón "Nuevo empleado" abre M-01.
- Estados: cargando, vacío ("No se encontraron empleados"), error.

**M-01 Modal de registro** (FR-UI-03)
- Formulario en **modal** con: número de documento, nombres, apellidos, edad, remuneración mensual, departamento (select), cargo (select).
- Validación en cliente espejo de §3.3; muestra el error del servidor en caso de documento duplicado.
- Éxito → cierra el modal, notifica y refresca la tabla.

### 4.2 Sesión y acceso

- Token en almacenamiento del navegador; se envía como `Authorization: Bearer` en cada llamada.
- Rutas privadas: sin token → redirección a P-01. Respuesta `401` → limpia sesión y vuelve a P-01.

---

## 5. Trazabilidad requisito → especificación

| Requisito (PROBLEM.md) | Cubierto por |
|---|---|
| FR-DB-01…03 | §2.1–2.4 |
| FR-DB-04 | §2.5 |
| FR-API-01 | §3.2 |
| FR-API-02 | §3.3 `GET /api/empleados` |
| FR-API-03 | §3.3 `POST /api/empleados` |
| FR-API-04 | §3.3 `GET /api/empleados?departamento=` |
| FR-UI-01 | §4.1 P-01 |
| FR-UI-02 | §4.1 P-02 |
| FR-UI-03 | §4.1 M-01 |
| FR-UI-04 | §4.1 P-02 (carga al montar) |
| FR-UI-05 | §4.1 P-02 (búsqueda) |
| AC-01…AC-15 | §2, §3, §4 |

---

## 6. Preguntas abiertas que persisten

1. Confirmar D-01 (área = departamento) con el evaluador.
2. Credenciales exactas del usuario de prueba a documentar en el README de entrega.
3. Forma de entrega del reto (repositorio, empaquetado, plazo) no consta en el PDF.
