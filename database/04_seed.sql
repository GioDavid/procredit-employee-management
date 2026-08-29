/*
    04_seed.sql
    Seed data: functional areas and positions named in the challenge,
    plus sample employees. Re-runnable (does not duplicate rows).
*/

USE ProCreditRRHH;
GO

INSERT INTO dbo.Departments (Name)
SELECT v.Name
FROM (VALUES
    (N'Recursos Humanos'),
    (N'Finanzas'),
    (N'Contabilidad'),
    (N'Marketing'),
    (N'Sistemas'),
    (N'Banca Empresas'),
    (N'Banca Personas')
) AS v(Name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Departments AS d WHERE d.Name = v.Name);
GO

INSERT INTO dbo.Positions (Name)
SELECT v.Name
FROM (VALUES
    (N'Analista de Recursos Humanos'),
    (N'Contador Senior'),
    (N'Supervisor de Créditos'),
    (N'Diseñador UX/UI'),
    (N'Especialista de Sistemas')
) AS v(Name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Positions AS p WHERE p.Name = v.Name);
GO

INSERT INTO dbo.Employees (DocumentNumber, FirstNames, LastNames, Age, MonthlySalary, DepartmentId, PositionId)
SELECT v.DocumentNumber, v.FirstNames, v.LastNames, v.Age, v.MonthlySalary, d.DepartmentId, p.PositionId
FROM (VALUES
    ('10000001', N'Ana María',  N'Pérez Rojas',      34, 4500.00, N'Recursos Humanos', N'Analista de Recursos Humanos'),
    ('10000002', N'Carlos',     N'Gómez Salinas',    41, 6800.00, N'Contabilidad',     N'Contador Senior'),
    ('10000003', N'Lucía',      N'Fernández Díaz',   38, 7200.00, N'Banca Empresas',   N'Supervisor de Créditos'),
    ('10000004', N'Diego',      N'Ramírez Castro',   29, 5200.00, N'Marketing',        N'Diseñador UX/UI'),
    ('10000005', N'Valeria',    N'Torres Mendoza',   31, 6100.00, N'Sistemas',         N'Especialista de Sistemas'),
    ('10000006', N'Jorge',      N'Vargas Núñez',     45, 7500.00, N'Finanzas',         N'Contador Senior'),
    ('10000007', N'Patricia',   N'Chávez Ríos',      27, 4300.00, N'Banca Personas',   N'Analista de Recursos Humanos')
) AS v(DocumentNumber, FirstNames, LastNames, Age, MonthlySalary, Department, Position)
    INNER JOIN dbo.Departments AS d ON d.Name = v.Department
    INNER JOIN dbo.Positions   AS p ON p.Name = v.Position
WHERE NOT EXISTS (SELECT 1 FROM dbo.Employees AS e WHERE e.DocumentNumber = v.DocumentNumber);
GO
