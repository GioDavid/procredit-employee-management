/*
    02_create_tables.sql
    Tables, primary keys (IDENTITY), foreign keys, and indexes.
    See docs/SPEC.md (2. Data model).
*/

USE ProCreditRRHH;
GO

IF OBJECT_ID(N'dbo.Departments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departments
    (
        DepartmentId INT IDENTITY(1,1) NOT NULL,
        Name         NVARCHAR(100)     NOT NULL,
        CONSTRAINT PK_Departments PRIMARY KEY (DepartmentId),
        CONSTRAINT UQ_Departments_Name UNIQUE (Name)
    );
END
GO

IF OBJECT_ID(N'dbo.Positions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Positions
    (
        PositionId INT IDENTITY(1,1) NOT NULL,
        Name       NVARCHAR(100)     NOT NULL,
        CONSTRAINT PK_Positions PRIMARY KEY (PositionId),
        CONSTRAINT UQ_Positions_Name UNIQUE (Name)
    );
END
GO

IF OBJECT_ID(N'dbo.Employees', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employees
    (
        EmployeeId      INT IDENTITY(1,1) NOT NULL,
        DocumentNumber  VARCHAR(20)       NOT NULL,
        FirstNames      NVARCHAR(100)     NOT NULL,
        LastNames       NVARCHAR(100)     NOT NULL,
        Age             INT               NOT NULL,
        MonthlySalary   DECIMAL(18,2)     NOT NULL,
        DepartmentId    INT               NOT NULL,
        PositionId      INT               NOT NULL,
        CONSTRAINT PK_Employees PRIMARY KEY (EmployeeId),
        CONSTRAINT UQ_Employees_DocumentNumber UNIQUE (DocumentNumber),
        CONSTRAINT CK_Employees_Age CHECK (Age BETWEEN 18 AND 100),
        CONSTRAINT CK_Employees_MonthlySalary CHECK (MonthlySalary >= 0),
        CONSTRAINT FK_Employees_Departments FOREIGN KEY (DepartmentId)
            REFERENCES dbo.Departments (DepartmentId),
        CONSTRAINT FK_Employees_Positions FOREIGN KEY (PositionId)
            REFERENCES dbo.Positions (PositionId)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Employees_DepartmentId' AND object_id = OBJECT_ID(N'dbo.Employees'))
    CREATE INDEX IX_Employees_DepartmentId ON dbo.Employees (DepartmentId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Employees_PositionId' AND object_id = OBJECT_ID(N'dbo.Employees'))
    CREATE INDEX IX_Employees_PositionId ON dbo.Employees (PositionId);
GO
