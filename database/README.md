# database/ — SQL Server

Scripts that create the `ProCreditRRHH` database (see `docs/SPEC.md` §2).

| Script | Contents |
|---|---|
| `01_create_database.sql` | Database with collation `Latin1_General_CI_AI` (case- and accent-insensitive search) |
| `02_create_tables.sql` | Tables `Departments`, `Positions`, `Employees` with PK IDENTITY, UNIQUE, CHECK, FK, and indexes |
| `03_stored_procedures.sql` | `usp_Employee_Get` (full listing and search by department) |
| `04_seed.sql` | Challenge areas and positions plus sample employees |
| `99_run_all.sql` | Runs the scripts above in order (SQLCMD mode) |

All scripts are re-runnable: they do not fail or duplicate data if the English-named schema already exists.

If a previous Spanish-named schema (`Departamento`, `Cargo`, `Empleado`, `usp_Empleado_Consultar`) is present, drop and recreate the database. Do not run these scripts as an in-place migration.

## Start SQL Server with Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=ProCredit!2026" \
  -p 1433:1433 --name procredit-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

## Run the scripts

```bash
cd database
sqlcmd -S localhost -U sa -P 'ProCredit!2026' -C -i 99_run_all.sql
```

To drop and recreate a local database:

```bash
cd database
sqlcmd -S localhost -U sa -P 'ProCredit!2026' -C -Q "ALTER DATABASE ProCreditRRHH SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE ProCreditRRHH;"
sqlcmd -S localhost -U sa -P 'ProCredit!2026' -C -i 99_run_all.sql
```

In SSMS or Azure Data Studio: open `99_run_all.sql`, enable SQLCMD mode, and execute; or open scripts `01`–`04` and run them in order.

## Quick check

```sql
USE ProCreditRRHH;
EXEC dbo.usp_Employee_Get;                           -- all employees
EXEC dbo.usp_Employee_Get @Department = N'banca';    -- partial match
```

Connection string for the API:

```
Server=localhost,1433;Database=ProCreditRRHH;User Id=sa;Password=ProCredit!2026;TrustServerCertificate=True;
```
