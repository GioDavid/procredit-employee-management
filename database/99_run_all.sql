/*
    99_run_all.sql
    Ejecuta todos los scripts en orden. Requiere el modo SQLCMD
    (sqlcmd, o "Query > SQLCMD Mode" en SSMS) y ejecutarse desde la
    carpeta database/.

        sqlcmd -S localhost -U sa -P <clave> -C -i 99_run_all.sql
*/

:r 01_create_database.sql
:r 02_create_tables.sql
:r 03_stored_procedures.sql
:r 04_seed.sql
GO

PRINT 'Base de datos ProCreditRRHH lista.';
GO
