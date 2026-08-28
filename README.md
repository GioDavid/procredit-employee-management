# procredit-employee-management

Sistema de gestión de empleados para Banco ProCredit (prueba técnica FullStack).

Desarrollo guiado por especificación (Specification-Driven Development): la fuente de verdad es el reto técnico, resumido en [`docs/PROBLEM.md`](docs/PROBLEM.md).

## Estructura

```
procredit-employee-management/
├── docs/         Especificaciones y documentación (PROBLEM.md, SPEC.md, PLAN.md)
├── database/     Base de datos SQL Server (tablas, relaciones, stored procedure)
├── backend/      API Rest en C# con .NET 10, arquitectura en capas
├── frontend/     Aplicación React 19
├── README.md
└── .gitignore
```

## Estado

- [x] `docs/PROBLEM.md` — análisis del reto (contexto, requisitos, entidades, criterios de aceptación, ambigüedades)
- [x] `docs/SPEC.md` — especificación (modelo de datos, contratos de API, pantallas)
- [x] `docs/PLAN.md` — plan de implementación por fases
- [x] `database/` — scripts SQL Server (tablas, FKs, `usp_Empleado_Consultar`, semilla)
- [x] `backend/` — API REST .NET 10 en capas (JWT, listado, búsqueda, alta)
- [x] `frontend/` — SPA React 19 + Material UI (login, listado con búsqueda, alta en modal)

## Cómo levantar el proyecto

1. **Base de datos** — `database/README.md`: contenedor de SQL Server y `99_run_all.sql`.
2. **API** — `backend/README.md`: variables de entorno (`.env.example`) y `dotnet run --project src/ProCredit.Api`.
3. **Frontend** — `frontend/README.md`: `npm install && npm run dev` en `http://localhost:5173`.
