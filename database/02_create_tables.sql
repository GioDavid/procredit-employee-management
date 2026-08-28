/*
    02_create_tables.sql
    Tablas, claves primarias (IDENTITY), claves foráneas e índices.
    Ver docs/SPEC.md (2. Modelo de datos).
*/

USE ProCreditRRHH;
GO

IF OBJECT_ID(N'dbo.Departamento', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departamento
    (
        DepartamentoId INT IDENTITY(1,1) NOT NULL,
        Nombre         NVARCHAR(100)     NOT NULL,
        CONSTRAINT PK_Departamento PRIMARY KEY (DepartamentoId),
        CONSTRAINT UQ_Departamento_Nombre UNIQUE (Nombre)
    );
END
GO

IF OBJECT_ID(N'dbo.Cargo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cargo
    (
        CargoId INT IDENTITY(1,1) NOT NULL,
        Nombre  NVARCHAR(100)     NOT NULL,
        CONSTRAINT PK_Cargo PRIMARY KEY (CargoId),
        CONSTRAINT UQ_Cargo_Nombre UNIQUE (Nombre)
    );
END
GO

IF OBJECT_ID(N'dbo.Empleado', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Empleado
    (
        EmpleadoId          INT IDENTITY(1,1) NOT NULL,
        NumeroDocumento     VARCHAR(20)       NOT NULL,
        Nombres             NVARCHAR(100)     NOT NULL,
        Apellidos           NVARCHAR(100)     NOT NULL,
        Edad                INT               NOT NULL,
        RemuneracionMensual DECIMAL(18,2)     NOT NULL,
        DepartamentoId      INT               NOT NULL,
        CargoId             INT               NOT NULL,
        CONSTRAINT PK_Empleado PRIMARY KEY (EmpleadoId),
        CONSTRAINT UQ_Empleado_NumeroDocumento UNIQUE (NumeroDocumento),
        CONSTRAINT CK_Empleado_Edad CHECK (Edad BETWEEN 18 AND 100),
        CONSTRAINT CK_Empleado_Remuneracion CHECK (RemuneracionMensual >= 0),
        CONSTRAINT FK_Empleado_Departamento FOREIGN KEY (DepartamentoId)
            REFERENCES dbo.Departamento (DepartamentoId),
        CONSTRAINT FK_Empleado_Cargo FOREIGN KEY (CargoId)
            REFERENCES dbo.Cargo (CargoId)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Empleado_DepartamentoId' AND object_id = OBJECT_ID(N'dbo.Empleado'))
    CREATE INDEX IX_Empleado_DepartamentoId ON dbo.Empleado (DepartamentoId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Empleado_CargoId' AND object_id = OBJECT_ID(N'dbo.Empleado'))
    CREATE INDEX IX_Empleado_CargoId ON dbo.Empleado (CargoId);
GO
