/*
    03_stored_procedures.sql
    Stored procedure de consulta de empleados (FR-DB-04).

    Resuelve tanto el listado completo como la búsqueda filtrada por
    departamento: si @Departamento es NULL o vacío devuelve todos los
    empleados; en caso contrario filtra por coincidencia parcial del
    nombre del departamento. Ver docs/SPEC.md (2.5, D-07).
*/

USE ProCreditRRHH;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Consultar
    @Departamento NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.EmpleadoId,
        e.NumeroDocumento,
        e.Nombres,
        e.Apellidos,
        e.Edad,
        e.RemuneracionMensual,
        e.DepartamentoId,
        d.Nombre AS Departamento,
        e.CargoId,
        c.Nombre AS Cargo
    FROM dbo.Empleado AS e
        INNER JOIN dbo.Departamento AS d ON d.DepartamentoId = e.DepartamentoId
        INNER JOIN dbo.Cargo        AS c ON c.CargoId = e.CargoId
    WHERE @Departamento IS NULL
       OR LTRIM(RTRIM(@Departamento)) = N''
       OR d.Nombre LIKE N'%' + LTRIM(RTRIM(@Departamento)) + N'%'
    ORDER BY e.Apellidos, e.Nombres;
END
GO
