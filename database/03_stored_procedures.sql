/*
    03_stored_procedures.sql
    Employee query stored procedure (FR-DB-04).

    Handles both the full listing and the department-filtered search:
    if @Department is NULL or empty, all employees are returned;
    otherwise the result is filtered by a partial match on the
    department name. See docs/SPEC.md (2.5, D-07).
*/

USE ProCreditRRHH;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Employee_Get
    @Department NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.EmployeeId,
        e.DocumentNumber,
        e.FirstNames,
        e.LastNames,
        e.Age,
        e.MonthlySalary,
        e.DepartmentId,
        d.Name AS Department,
        e.PositionId,
        p.Name AS Position
    FROM dbo.Employees AS e
        INNER JOIN dbo.Departments AS d ON d.DepartmentId = e.DepartmentId
        INNER JOIN dbo.Positions   AS p ON p.PositionId = e.PositionId
    WHERE @Department IS NULL
       OR LTRIM(RTRIM(@Department)) = N''
       OR d.Name LIKE N'%' + LTRIM(RTRIM(@Department)) + N'%'
    ORDER BY e.LastNames, e.FirstNames;
END
GO
