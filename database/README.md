# database/ — SQL Server

Scripts de creación de la base de datos `ProCreditRRHH` (ver `docs/SPEC.md` §2).

| Script | Contenido |
|---|---|
| `01_create_database.sql` | Base de datos con collation `Latin1_General_CI_AI` (búsqueda insensible a mayúsculas y acentos) |
| `02_create_tables.sql` | Tablas `Departamento`, `Cargo`, `Empleado` con PK IDENTITY, UNIQUE, CHECK, FK e índices |
| `03_stored_procedures.sql` | `usp_Empleado_Consultar` (listado completo y búsqueda por departamento) |
| `04_seed.sql` | Áreas y cargos del reto + empleados de ejemplo |
| `99_run_all.sql` | Ejecuta los anteriores en orden (modo SQLCMD) |

Todos los scripts son reejecutables: no fallan ni duplican datos si la base ya existe.

## Levantar SQL Server con Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=ProCredit!2026" \
  -p 1433:1433 --name procredit-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

## Ejecutar los scripts

```bash
cd database
sqlcmd -S localhost -U sa -P 'ProCredit!2026' -C -i 99_run_all.sql
```

En SSMS o Azure Data Studio: abrir `99_run_all.sql`, activar el modo SQLCMD y ejecutar; o abrir los scripts `01`–`04` y ejecutarlos en orden.

## Comprobación rápida

```sql
USE ProCreditRRHH;
EXEC dbo.usp_Empleado_Consultar;                    -- todos los empleados
EXEC dbo.usp_Empleado_Consultar @Departamento = N'banca';  -- coincidencia parcial
```

Cadena de conexión para la API:

```
Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=ProCredit!2026;TrustServerCertificate=True;
```
