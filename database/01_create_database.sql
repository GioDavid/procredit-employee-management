/*
    01_create_database.sql
    Crea la base de datos ProCreditRRHH.

    La collation Latin1_General_CI_AI es requisito de la búsqueda por
    departamento: insensible a mayúsculas (CI) y a acentos (AI).
    Ver docs/SPEC.md (D-02).
*/

IF DB_ID(N'ProCreditRRHH') IS NULL
BEGIN
    CREATE DATABASE ProCreditRRHH COLLATE Latin1_General_CI_AI;
END
GO

ALTER DATABASE ProCreditRRHH COLLATE Latin1_General_CI_AI;
GO
