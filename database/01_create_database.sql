/*
    01_create_database.sql
    Creates the ProCreditRRHH database.

    Collation Latin1_General_CI_AI is required for department search:
    case-insensitive (CI) and accent-insensitive (AI).
    See docs/SPEC.md (D-02).
*/

IF DB_ID(N'ProCreditRRHH') IS NULL
BEGIN
    CREATE DATABASE ProCreditRRHH COLLATE Latin1_General_CI_AI;
END
GO

ALTER DATABASE ProCreditRRHH COLLATE Latin1_General_CI_AI;
GO
