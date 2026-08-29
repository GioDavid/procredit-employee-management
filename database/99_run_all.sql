/*
    99_run_all.sql
    Runs all scripts in order. Requires SQLCMD mode
    (sqlcmd, or "Query > SQLCMD Mode" in SSMS) and must be executed
    from the database/ folder.

        sqlcmd -S localhost -U sa -P <password> -C -i 99_run_all.sql

    After the English naming refactor, drop and recreate the local
    database instead of re-running this against an existing Spanish schema:

        sqlcmd -S localhost -U sa -P <password> -C -Q "ALTER DATABASE ProCreditRRHH SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE ProCreditRRHH;"
        sqlcmd -S localhost -U sa -P <password> -C -i 99_run_all.sql
*/

:r 01_create_database.sql
:r 02_create_tables.sql
:r 03_stored_procedures.sql
:r 04_seed.sql
GO

PRINT 'ProCreditRRHH database is ready.';
GO
