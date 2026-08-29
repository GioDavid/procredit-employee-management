# ProCredit Employee Management

Sistema de gestión de empleados desarrollado como prueba técnica Full Stack para Banco ProCredit.

La aplicación reemplaza el manejo de información mediante hojas de cálculo por una solución relacional para administrar empleados, departamentos y cargos, evitando duplicación de información y centralizando el acceso a los datos.

El proyecto fue desarrollado siguiendo un enfoque de **Specification-Driven Development (SDD)**. La definición del problema, la especificación técnica y el plan de implementación se encuentran en el directorio `docs/`.

---

## Tecnologías

### Backend

- .NET 10
- ASP.NET Core Web API
- C#
- JWT Bearer Authentication
- SQL Server
- ADO.NET
- Stored Procedures
- Swagger / OpenAPI

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- Fetch API

### Base de datos

- Microsoft SQL Server 2022
- Modelo relacional
- Primary Keys
- Foreign Keys
- Identity columns
- Stored Procedures
- Seed data

---

## Estructura del proyecto

```text
procredit-employee-management/
├── docs/
│   ├── PLAN.md
│   ├── PROBLEM.md
│   └── SPEC.md
│
├── database/
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   ├── 03_stored_procedures.sql
│   ├── 04_seed.sql
│   ├── 99_run_all.sql
│   └── README.md
│
├── backend/
│   ├── src/
│   ├── .env.example
│   └── README.md
│
├── frontend/
│
├── README.md
└── .gitignore
```

---

## Arquitectura

La aplicación está dividida en tres componentes principales:

```text
React 19 Frontend
        │
        │ HTTP / REST
        │ Bearer Token
        ▼
ASP.NET Core .NET 10 API
        │
        │ ADO.NET / Stored Procedures
        ▼
SQL Server
```

El backend utiliza una arquitectura en capas:

```text
ProCredit.Api
    Controllers
    JWT Authentication
    Error handling
    Swagger

ProCredit.Application
    Use cases
    DTOs
    Validation
    Interfaces

ProCredit.Domain
    Domain entities

ProCredit.Infrastructure
    SQL Server access
    Repository implementations
    JWT generation
```

Las dependencias principales son:

```text
Api → Application → Domain
           ↑
    Infrastructure
```

`Infrastructure` implementa las interfaces declaradas en `Application`.

---

# Requisitos

Para ejecutar el proyecto localmente se necesita:

- Docker Desktop
- .NET 10 SDK
- Node.js
- npm
- Git

Opcionalmente:

- `jq` para ejecutar los ejemplos de API desde terminal.

---

# Ejecutar el proyecto localmente

La aplicación requiere tres componentes:

1. SQL Server
2. ASP.NET Core API
3. React frontend

---

## 1. Iniciar SQL Server

SQL Server 2022 puede ejecutarse mediante Docker.

```bash
docker run --name procredit-sql \
  --platform linux/amd64 \
  -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=<YOUR_SQL_PASSWORD>' \
  -p 1433:1433 \
  -d \
  mcr.microsoft.com/mssql/server:2022-latest
```

> En equipos Mac con Apple Silicon se utiliza `--platform linux/amd64`
> para ejecutar la imagen de SQL Server mediante emulación.

Verificar que el contenedor esté ejecutándose:

```bash
docker ps
```

También se pueden revisar los logs:

```bash
docker logs procredit-sql
```

SQL Server estará listo cuando aparezca un mensaje similar a:

```text
SQL Server is now ready for client connections
```

---

## 2. Inicializar la base de datos

Copiar los scripts SQL al contenedor:

```bash
docker cp database/. procredit-sql:/tmp/database/
```

Verificar que los archivos hayan sido copiados:

```bash
docker exec procredit-sql ls -la /tmp/database
```

Ejecutar el script principal desde el directorio que contiene los scripts:

```bash
docker exec -w /tmp/database procredit-sql \
  /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P '<YOUR_SQL_PASSWORD>' \
  -C \
  -i 99_run_all.sql
```

`99_run_all.sql` ejecuta la inicialización de:

```text
01_create_database.sql
02_create_tables.sql
03_stored_procedures.sql
04_seed.sql
```

Esto crea la base de datos:

```text
ProCreditRRHH
```

junto con sus tablas, relaciones, stored procedures y datos iniciales.

### Verificar la base de datos

```bash
docker exec procredit-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P '<YOUR_SQL_PASSWORD>' \
  -C \
  -Q "SELECT name FROM sys.databases;"
```

Entre las bases de datos debería aparecer:

```text
ProCreditRRHH
```

La inicialización solamente es necesaria durante la configuración inicial.

---

# Backend — API REST (.NET 10)

## Arquitectura del backend

La API está organizada en los siguientes proyectos:

```text
ProCredit.Api             Controllers, autenticación JWT, manejo de errores y Swagger

ProCredit.Application     Casos de uso, DTOs, validaciones e interfaces

ProCredit.Domain          Entidades de dominio

ProCredit.Infrastructure  Acceso a SQL Server, stored procedures y generación de JWT
```

Dependencias:

```text
Api → Application → Domain
```

`Infrastructure` implementa las interfaces declaradas en `Application`.

---

## Configurar el entorno local

Los valores sensibles como:

- cadena de conexión
- contraseña del usuario de prueba
- clave de firma JWT

no deben estar versionados.

El archivo:

```text
backend/.env.example
```

contiene una referencia de las variables necesarias.

Desde el directorio `backend`:

```bash
cd backend
cp .env.example .env
```

Completar `.env` con los valores locales.

Ejemplo:

```text
ConnectionStrings__ProCreditRRHH=Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=<YOUR_SQL_PASSWORD>;TrustServerCertificate=True;Encrypt=True;

UsuarioPrueba__Usuario=admin
UsuarioPrueba__Clave=<YOUR_TEST_USER_PASSWORD>

Jwt__ClaveSecreta=<YOUR_RANDOM_JWT_SECRET>
```

Para generar una clave JWT aleatoria:

```bash
openssl rand -base64 48
```

Cargar las variables del archivo:

```bash
set -a && source .env && set +a
```

> `.env` contiene información sensible y no debe agregarse al repositorio.

---

## Alternativa: variables de entorno

También es posible configurar las variables directamente desde la terminal:

```bash
export UsuarioPrueba__Clave='<YOUR_TEST_USER_PASSWORD>'

export Jwt__ClaveSecreta="$(openssl rand -base64 48)"

export ConnectionStrings__ProCreditRRHH='Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=<YOUR_SQL_PASSWORD>;TrustServerCertificate=True;'
```

Estas variables deben configurarse en la misma terminal desde la cual se inicia la API.

---

## Alternativa: .NET User Secrets

Desde el proyecto de la API:

```bash
cd backend/src/ProCredit.Api
```

Inicializar User Secrets:

```bash
dotnet user-secrets init
```

Configurar la conexión:

```bash
dotnet user-secrets set \
  "ConnectionStrings:ProCreditRRHH" \
  "Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=<YOUR_SQL_PASSWORD>;TrustServerCertificate=True;Encrypt=True;"
```

Configurar la contraseña del usuario de prueba:

```bash
dotnet user-secrets set \
  "UsuarioPrueba:Clave" \
  "<YOUR_TEST_USER_PASSWORD>"
```

Configurar la clave JWT:

```bash
dotnet user-secrets set \
  "Jwt:ClaveSecreta" \
  "<YOUR_RANDOM_JWT_SECRET>"
```

---

## Ejecutar el backend

Desde la raíz del repositorio:

```bash
dotnet run --project backend/src/ProCredit.Api/ProCredit.Api.csproj
```

También puede ejecutarse desde `backend`:

```bash
cd backend
dotnet run --project src/ProCredit.Api
```

La terminal mostrará la URL utilizada por la API:

```text
Now listening on: http://localhost:<PORT>
```

Por ejemplo:

```text
Now listening on: http://localhost:5022
```

Mantener esta terminal ejecutándose mientras se utiliza la aplicación.

---

## Swagger

Durante desarrollo, Swagger está disponible en:

```text
http://localhost:<PORT>/swagger
```

Para probar endpoints protegidos:

1. Ejecutar `POST /api/auth/login`.
2. Copiar el token recibido.
3. Seleccionar **Authorize**.
4. Proporcionar el Bearer Token.
5. Ejecutar los endpoints protegidos.

---

## Configuración del backend

La configuración principal se encuentra en:

```text
backend/src/ProCredit.Api/appsettings.json
```

| Clave | Descripción |
|---|---|
| `ConnectionStrings:ProCreditRRHH` | Cadena de conexión a SQL Server. El valor sensible se proporciona localmente. |
| `UsuarioPrueba` | Usuario de prueba preconfigurado. |
| `Jwt` | Issuer, Audience, tiempo de expiración y configuración JWT. |
| `Cors:OrigenesPermitidos` | Orígenes permitidos para el frontend. |

El origen esperado del frontend durante desarrollo es:

```text
http://localhost:5173
```

---

# Autenticación

La API utiliza:

```text
JWT Bearer Authentication
```

El usuario de prueba preconfigurado es:

```text
admin
```

La contraseña corresponde al valor configurado localmente en:

```text
UsuarioPrueba__Clave
```

El endpoint:

```text
POST /api/auth/login
```

recibe:

```json
{
  "usuario": "admin",
  "clave": "<YOUR_TEST_USER_PASSWORD>"
}
```

y devuelve:

```json
{
  "token": "<JWT>",
  "expiraEn": "<EXPIRATION_DATE>"
}
```

Los endpoints protegidos reciben posteriormente:

```text
Authorization: Bearer <JWT>
```

---

# Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Autenticación. Devuelve `{ token, expiraEn }`. |
| `GET` | `/api/empleados` | Bearer | Lista todos los empleados. |
| `GET` | `/api/empleados?departamento=banca` | Bearer | Filtra empleados por coincidencia parcial del departamento. |
| `GET` | `/api/empleados/{id}` | Bearer | Obtiene un empleado por ID. |
| `POST` | `/api/empleados` | Bearer | Registra un nuevo empleado. |
| `GET` | `/api/departamentos` | Bearer | Obtiene el catálogo de departamentos. |
| `GET` | `/api/cargos` | Bearer | Obtiene el catálogo de cargos. |

La creación de empleados puede devolver:

```text
201 Created
400 Bad Request
409 Conflict
```

dependiendo del resultado de la operación.

---

## Ejemplo de uso de la API

Con la API ejecutándose:

```bash
TOKEN=$(curl -s -X POST http://localhost:<PORT>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"usuario\":\"$UsuarioPrueba__Usuario\",\"clave\":\"$UsuarioPrueba__Clave\"}" \
  | jq -r .token)
```

Consultar empleados:

```bash
curl \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:<PORT>/api/empleados"
```

Filtrar por departamento:

```bash
curl \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:<PORT>/api/empleados?departamento=banca"
```

---

# Frontend — React 19

El frontend consume la API REST y proporciona las siguientes funcionalidades:

- Login
- Autenticación mediante Bearer Token
- Listado de empleados
- Búsqueda por departamento
- Creación de empleados
- Catálogos de departamentos y cargos
- Logout
- Estados de carga
- Manejo de errores

Tecnologías:

```text
React 19
TypeScript
Vite
Material UI
Fetch API
```

---

## Configurar el frontend

Abrir una nueva terminal:

```bash
cd frontend
```

Crear el archivo:

```text
.env.local
```

con la URL mostrada por el backend.

Por ejemplo:

```bash
echo 'VITE_API_URL=http://localhost:5022' > .env.local
```

Si la API utiliza otro puerto, reemplazar `5022` por el puerto correspondiente.

---

## Ejecutar el frontend

Instalar dependencias:

```bash
npm install
```

Iniciar Vite:

```bash
npm run dev
```

Normalmente la aplicación estará disponible en:

```text
http://localhost:5173
```

Abrir esa dirección en el navegador.

---

## Login desde el frontend

Utilizar:

```text
Username: admin
Password: <YOUR_TEST_USER_PASSWORD>
```

La contraseña debe coincidir con:

```text
UsuarioPrueba__Clave
```

Después de autenticarse, el frontend utiliza automáticamente el JWT para consumir los endpoints protegidos.

---

# Flujo completo de la aplicación

```text
Browser
   │
   ▼
React 19
localhost:5173
   │
   │ POST /api/auth/login
   │ GET  /api/empleados
   │ POST /api/empleados
   │
   │ Authorization: Bearer JWT
   ▼
ASP.NET Core API
localhost:<PORT>
   │
   │ ADO.NET
   │ Stored Procedures
   ▼
SQL Server
localhost:1433
   │
   ▼
ProCreditRRHH
```

---

# Ejecuciones posteriores

Después de realizar la configuración inicial, no es necesario volver a crear la base de datos.

Se necesitan tres terminales.

## Terminal 1 — SQL Server

Iniciar el contenedor existente:

```bash
docker start procredit-sql
```

Verificar:

```bash
docker ps
```

---

## Terminal 2 — Backend

Utilizando `.env`:

```bash
cd backend

set -a && source .env && set +a

dotnet run --project src/ProCredit.Api
```

También se pueden configurar las variables manualmente antes de iniciar la API.

---

## Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

---

# Detener el proyecto

Detener frontend:

```text
Ctrl+C
```

Detener backend:

```text
Ctrl+C
```

Detener SQL Server:

```bash
docker stop procredit-sql
```

Para iniciar SQL Server nuevamente:

```bash
docker start procredit-sql
```

---

# Seguridad

No deben versionarse:

- contraseñas de SQL Server
- contraseñas de usuarios
- JWT signing secrets
- archivos `.env`
- connection strings con credenciales reales

El repositorio utiliza:

```text
backend/.env.example
```

como referencia para las variables necesarias.

Cada desarrollador debe proporcionar sus propios valores locales.

---

# Validación del proyecto

Antes de entregar cambios se recomienda validar el backend:

```bash
dotnet build backend/src/ProCredit.Api/ProCredit.Api.csproj
```

Validar el frontend:

```bash
cd frontend
npm run build
```

También se recomienda validar manualmente:

- Login
- Generación del JWT
- Listado de empleados
- Búsqueda por departamento
- Creación de empleados
- Persistencia en SQL Server
- Logout

---

# Specification-Driven Development

El proyecto fue desarrollado siguiendo un enfoque de **Specification-Driven Development (SDD)**.

La documentación se encuentra en:

```text
docs/
├── PROBLEM.md
├── SPEC.md
└── PLAN.md
```

### `PROBLEM.md`

Contiene el análisis del problema, contexto, requisitos, entidades y criterios de aceptación.

### `SPEC.md`

Define la especificación funcional y técnica de la solución, incluyendo el modelo de datos, contratos de API y arquitectura.

### `PLAN.md`

Define el plan de implementación y las fases utilizadas para construir la solución.

El flujo seguido fue:

```text
Problem
   ↓
Specification
   ↓
Implementation Plan
   ↓
Database
   ↓
Backend
   ↓
Frontend
   ↓
Integration
   ↓
Verification
```

---

# Estado del proyecto

- [x] Análisis del problema
- [x] Especificación funcional y técnica
- [x] Plan de implementación
- [x] Modelo relacional SQL Server
- [x] Primary Keys y Foreign Keys
- [x] Stored Procedure
- [x] Seed data
- [x] API REST .NET 10
- [x] Arquitectura en capas
- [x] JWT Bearer Authentication
- [x] Listado de empleados
- [x] Búsqueda por departamento
- [x] Creación de empleados
- [x] React 19 frontend
- [x] Login
- [x] Tabla de empleados
- [x] Filtro por departamento
- [x] Modal de creación de empleados
- [x] Logout
- [x] Integración React → API → SQL Server
- [x] Validación end-to-end