/*
    04_seed.sql
    Datos semilla: áreas funcionales y cargos citados en el reto,
    más empleados de ejemplo. Reejecutable (no duplica filas).
*/

USE ProCreditRRHH;
GO

INSERT INTO dbo.Departamento (Nombre)
SELECT v.Nombre
FROM (VALUES
    (N'Recursos Humanos'),
    (N'Finanzas'),
    (N'Contabilidad'),
    (N'Marketing'),
    (N'Sistemas'),
    (N'Banca Empresas'),
    (N'Banca Personas')
) AS v(Nombre)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Departamento AS d WHERE d.Nombre = v.Nombre);
GO

INSERT INTO dbo.Cargo (Nombre)
SELECT v.Nombre
FROM (VALUES
    (N'Analista de Recursos Humanos'),
    (N'Contador Senior'),
    (N'Supervisor de Créditos'),
    (N'Diseñador UX/UI'),
    (N'Especialista de Sistemas')
) AS v(Nombre)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Cargo AS c WHERE c.Nombre = v.Nombre);
GO

INSERT INTO dbo.Empleado (NumeroDocumento, Nombres, Apellidos, Edad, RemuneracionMensual, DepartamentoId, CargoId)
SELECT v.NumeroDocumento, v.Nombres, v.Apellidos, v.Edad, v.RemuneracionMensual, d.DepartamentoId, c.CargoId
FROM (VALUES
    ('10000001', N'Ana María',  N'Pérez Rojas',      34, 4500.00, N'Recursos Humanos', N'Analista de Recursos Humanos'),
    ('10000002', N'Carlos',     N'Gómez Salinas',    41, 6800.00, N'Contabilidad',     N'Contador Senior'),
    ('10000003', N'Lucía',      N'Fernández Díaz',   38, 7200.00, N'Banca Empresas',   N'Supervisor de Créditos'),
    ('10000004', N'Diego',      N'Ramírez Castro',   29, 5200.00, N'Marketing',        N'Diseñador UX/UI'),
    ('10000005', N'Valeria',    N'Torres Mendoza',   31, 6100.00, N'Sistemas',         N'Especialista de Sistemas'),
    ('10000006', N'Jorge',      N'Vargas Núñez',     45, 7500.00, N'Finanzas',         N'Contador Senior'),
    ('10000007', N'Patricia',   N'Chávez Ríos',      27, 4300.00, N'Banca Personas',   N'Analista de Recursos Humanos')
) AS v(NumeroDocumento, Nombres, Apellidos, Edad, RemuneracionMensual, Departamento, Cargo)
    INNER JOIN dbo.Departamento AS d ON d.Nombre = v.Departamento
    INNER JOIN dbo.Cargo        AS c ON c.Nombre = v.Cargo
WHERE NOT EXISTS (SELECT 1 FROM dbo.Empleado AS e WHERE e.NumeroDocumento = v.NumeroDocumento);
GO
