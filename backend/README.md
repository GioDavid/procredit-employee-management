# backend/ — REST API (.NET 10)

Layered architecture (see `docs/SPEC.md` §3.1):

```
ProCredit.Api             Controllers, JWT authentication, error middleware, Swagger
ProCredit.Application     Use cases, DTOs, validation, interfaces
ProCredit.Domain          Entities
ProCredit.Infrastructure  SQL Server (invokes usp_Employee_Get), JWT issuance
```

Dependencies: `Api → Application → Domain`; `Infrastructure` implements the interfaces declared in `Application`.

## Requirements

- .NET 10 SDK
- Database `ProCreditRRHH` created (see `../database/README.md`)

## Configure the local environment

Sensitive values (connection string, test-user password, and JWT signing key) are **not** versioned: `appsettings.json` leaves them empty and the API fails to start if they are missing.

```bash
cd backend
cp .env.example .env      # fill in the values
set -a && source .env && set +a
```

Alternative without an `.env` file (.NET User Secrets):

```bash
cd backend/src/ProCredit.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:ProCreditRRHH" "Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=<SA_PASSWORD>;TrustServerCertificate=True;Encrypt=True;"
dotnet user-secrets set "TestUser:Password" "<TEST_USER_PASSWORD>"
dotnet user-secrets set "Jwt:SecretKey" "<RANDOM_STRING_AT_LEAST_32_CHARACTERS>"
```

## Run

```bash
cd backend
dotnet run --project src/ProCredit.Api
```

Swagger: `http://localhost:<port>/swagger` (**Authorize** to paste the token).

## Configuration (`src/ProCredit.Api/appsettings.json`)

| Key | Description |
|---|---|
| `ConnectionStrings:ProCreditRRHH` | SQL Server connection string (empty: supplied by environment) |
| `TestUser` | Preconfigured test user (`admin`); password is supplied by environment |
| `Jwt` | Issuer, audience, expiration minutes (60); secret key is supplied by environment |
| `Cors:AllowedOrigins` | Frontend origins (default `http://localhost:5173`) |

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Returns `{ token, expiresAt }`; 401 if credentials do not match |
| `GET` | `/api/employees` | Bearer | All employees |
| `GET` | `/api/employees?department=banca` | Bearer | Partial match on department name |
| `GET` | `/api/employees/{id}` | Bearer | Employee by id |
| `POST` | `/api/employees` | Bearer | Create; 201, 400 validation, 409 duplicate document |
| `GET` | `/api/departments` | Bearer | Catalog for the create form |
| `GET` | `/api/positions` | Bearer | Catalog for the create form |

Example:

```bash
TOKEN=$(curl -s -X POST http://localhost:5080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$TestUser__Username\",\"password\":\"$TestUser__Password\"}" | jq -r .token)

curl -H "Authorization: Bearer $TOKEN" "http://localhost:5080/api/employees?department=banca"
```
