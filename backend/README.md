# backend/ — API REST (.NET 10)

Arquitectura en capas (ver `docs/SPEC.md` §3.1):

```
ProCredit.Api             Controllers, autenticación JWT, middleware de errores, Swagger
ProCredit.Application     Casos de uso, DTOs, validaciones, interfaces
ProCredit.Domain          Entidades
ProCredit.Infrastructure  SQL Server (invoca usp_Empleado_Consultar), emisión de JWT
```

Dependencias: `Api → Application → Domain`; `Infrastructure` implementa las interfaces declaradas en `Application`.

## Requisitos

- .NET 10 SDK
- Base de datos `ProCreditRRHH` creada (ver `../database/README.md`)

## Configurar el entorno local

Los valores sensibles (cadena de conexión, clave del usuario de prueba y clave de firma del JWT) **no** están versionados: `appsettings.json` los deja vacíos y la API falla al arrancar si no se proporcionan.

```bash
cd backend
cp .env.example .env      # completa los valores
set -a && source .env && set +a
```

Alternativa sin archivo `.env` (User Secrets de .NET):

```bash
cd backend/src/ProCredit.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:ProCreditRRHH" "Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=<CLAVE_SA>;TrustServerCertificate=True;Encrypt=True;"
dotnet user-secrets set "UsuarioPrueba:Clave" "<CLAVE_DE_PRUEBA>"
dotnet user-secrets set "Jwt:ClaveSecreta" "<CADENA_ALEATORIA_MINIMO_32_CARACTERES>"
```

## Ejecutar

```bash
cd backend
dotnet run --project src/ProCredit.Api
```

Swagger: `http://localhost:<puerto>/swagger` (botón **Authorize** para pegar el token).

## Configuración (`src/ProCredit.Api/appsettings.json`)

| Clave | Descripción |
|---|---|
| `ConnectionStrings:ProCreditRRHH` | Cadena de conexión a SQL Server (vacía: se aporta por entorno) |
| `UsuarioPrueba` | Usuario de prueba preconfigurado (`admin`); la clave se aporta por entorno |
| `Jwt` | Issuer, audience, minutos de expiración (60); la clave secreta se aporta por entorno |
| `Cors:OrigenesPermitidos` | Orígenes del frontend (por defecto `http://localhost:5173`) |

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Devuelve `{ token, expiraEn }`; 401 si las credenciales no coinciden |
| `GET` | `/api/empleados` | Bearer | Todos los empleados |
| `GET` | `/api/empleados?departamento=banca` | Bearer | Búsqueda por coincidencia parcial del departamento |
| `GET` | `/api/empleados/{id}` | Bearer | Empleado por id |
| `POST` | `/api/empleados` | Bearer | Alta; 201, 400 validación, 409 documento duplicado |
| `GET` | `/api/departamentos` | Bearer | Catálogo para el formulario de alta |
| `GET` | `/api/cargos` | Bearer | Catálogo para el formulario de alta |

Ejemplo:

```bash
TOKEN=$(curl -s -X POST http://localhost:5080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"usuario\":\"$UsuarioPrueba__Usuario\",\"clave\":\"$UsuarioPrueba__Clave\"}" | jq -r .token)

curl -H "Authorization: Bearer $TOKEN" "http://localhost:5080/api/empleados?departamento=banca"
```
