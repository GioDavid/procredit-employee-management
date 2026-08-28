# PROBLEM.md — Sistema de Gestión de Empleados (Banco ProCredit)

> Fuente de verdad: `Prueba_Desarrollador_FullStack_Digital_v1.1.pdf` — "Test de evaluación práctico de conocimiento — Desarrollador de Software FullStack" (Tecnologías de la Información, 2026. Clasificación: Restricted to ProCreditGroup).
>
> Convención de este documento:
> - **[EXPLÍCITO]** = está textualmente en el reto.
> - **[INFERIDO]** = derivación directa y necesaria de un enunciado explícito (no es una decisión de diseño).
> - **[RECOMENDACIÓN]** = sugerencia propia, NO exigida por el reto.
> - Se preserva la terminología del reto (empleado/colaborador/trabajador, área, cargo, departamento, remuneración mensual, etc.).

---

## 1. Business context

**[EXPLÍCITO]**

- Banco ProCredit ha experimentado un crecimiento acelerado en los últimos años.
- Debido al aumento de personal, la gerencia ha decidido reemplazar las hojas de cálculo utilizadas actualmente por un sistema de gestión de empleados basado en una base de datos relacional.
- Cada colaborador de la empresa debe estar registrado con su información personal.
- La organización utiliza el número de documento de identidad para identificar de manera única a cada empleado.
- Recursos Humanos necesita conocer datos básicos como nombres, apellidos y edad para gestionar procesos internos y beneficios corporativos.
- La empresa está organizada en diferentes áreas funcionales, tales como: Recursos Humanos, Finanzas, Contabilidad, Marketing, Sistemas, Banca Empresas y Banca Personas.
- Cada colaborador desempeña una función específica dentro de la organización; existen diversos cargos, por ejemplo: Analista de Recursos Humanos, Contador Senior, Supervisor de Créditos, Diseñador UX/UI o Especialista de Sistemas.
- El departamento de Nómina requiere almacenar la remuneración mensual de cada trabajador para reportes de gastos, cálculos de promedios salariales y análisis de costos por área.

## 2. Problem statement

**[EXPLÍCITO]** La gestión del personal se realiza actualmente en hojas de cálculo, lo cual resulta insuficiente frente al crecimiento acelerado del banco y al aumento de personal. Se requiere sustituirlas por un sistema de gestión de empleados soportado en una base de datos relacional, que registre a cada colaborador con su información personal, su área, su cargo y su remuneración mensual, evitando la duplicidad innecesaria de datos.

## 3. Business goals

**[EXPLÍCITO]**

1. Reemplazar las hojas de cálculo por un sistema de gestión de empleados basado en base de datos relacional.
2. Registrar a cada colaborador con su información personal e identificarlo de manera única por su número de documento de identidad.
3. Permitir a Recursos Humanos gestionar procesos internos y beneficios corporativos con datos básicos (nombres, apellidos, edad).
4. Reflejar la organización de la empresa en áreas funcionales y los cargos que desempeñan los colaboradores.
5. Permitir al departamento de Nómina elaborar reportes de gastos, cálculos de promedios salariales y análisis de costos por área a partir de la remuneración mensual almacenada.
6. Evitar la duplicidad innecesaria de datos: si cambia el nombre de un área o de un cargo, la modificación debe realizarse una sola vez y verse reflejada automáticamente en todos los empleados relacionados.

## 4. Functional requirements

### 4.1 Base de datos (SQL Server) — **[EXPLÍCITO]**

| ID | Requisito |
|----|-----------|
| FR-DB-01 | Levantar una base de datos en SQL Server. |
| FR-DB-02 | Tablas con PK e identities. |
| FR-DB-03 | Relaciones con FK. |
| FR-DB-04 | 1 Stored Procedure para consulta de empleados. |

### 4.2 API Rest (C# / .NET 10) — **[EXPLÍCITO]**

| ID | Requisito |
|----|-----------|
| FR-API-01 | Autenticación de tipo Bearer Token con un usuario de prueba preconfigurado. |
| FR-API-02 | Servicio de listado de todos los empleados. |
| FR-API-03 | Servicio para agregar nuevos empleados. |
| FR-API-04 | Servicio de búsqueda filtrada por departamento. |

### 4.3 Aplicación React 19 — **[EXPLÍCITO]**

| ID | Requisito |
|----|-----------|
| FR-UI-01 | Pantalla: Formulario de Login. |
| FR-UI-02 | Pantalla: listado de todos los empleados en una tabla. |
| FR-UI-03 | Formulario de registro de nuevo empleado en un modal. |
| FR-UI-04 | Integrar el servicio web de listado de todos los empleados; este se cargará al momento de acceder a la pantalla. |
| FR-UI-05 | Integrar el servicio web de búsqueda por coincidencias por el departamento al que pertenece el empleado. |

**[INFERIDO]** El formulario de registro (FR-UI-03) consume el servicio de agregar nuevos empleados (FR-API-03), y el Login (FR-UI-01) se apoya en la autenticación Bearer Token con el usuario de prueba preconfigurado (FR-API-01).

## 5. Technical requirements

**[EXPLÍCITO]**

- Motor de base de datos: **SQL Server**.
- Backend: **API Rest en C# con .NET 10**, con **arquitectura en capas**.
- Autenticación: **Bearer Token**, con **usuario de prueba preconfigurado**.
- Frontend: **React 19**, **utilizando librerías para el diseño de la UI**.
- Uso de **PK e identities** en tablas y **FK** para relaciones.
- Al menos **un Stored Procedure** para la consulta de empleados.

**[RECOMENDACIÓN]** (no exigido por el reto): scripts de creación de BD versionados, datos semilla para áreas y cargos, documentación de endpoints, manejo de errores y validaciones, pruebas automatizadas, contenedorización.

## 6. Main domain entities

**[EXPLÍCITO]** (nombrados en el enunciado)

1. **Empleado / colaborador / trabajador** — atributos mencionados: número de documento de identidad (identificador único), nombres, apellidos, edad, remuneración mensual.
2. **Área** (área funcional) — ejemplos: Recursos Humanos, Finanzas, Contabilidad, Marketing, Sistemas, Banca Empresas, Banca Personas.
3. **Cargo** (función específica) — ejemplos: Analista de Recursos Humanos, Contador Senior, Supervisor de Créditos, Diseñador UX/UI, Especialista de Sistemas.
4. **Usuario de prueba** para la autenticación de la API — mencionado solo como "usuario de prueba preconfigurado", sin atributos definidos.

**[INFERIDO]** Área y Cargo requieren existencia propia (entidades separadas) porque el reto exige que un cambio de nombre se realice una sola vez y se refleje en todos los empleados relacionados.

## 7. Relationships between entities

**[EXPLÍCITO]**

- **Área — Empleado**: cada trabajador forma parte de **una** de estas áreas, mientras que una misma área puede contar con **varios** empleados → 1:N (Área 1 — N Empleados).
- **Cargo — Empleado**: varios empleados pueden ocupar el mismo cargo, pero cada empleado **solamente puede desempeñar uno a la vez** → 1:N (Cargo 1 — N Empleados).
- **[INFERIDO]** Estas relaciones se materializan como claves foráneas (FK) desde Empleado hacia Área y hacia Cargo (FR-DB-03).

## 8. Explicit constraints from the challenge

1. El número de documento de identidad identifica de manera única a cada empleado.
2. Cada empleado pertenece a exactamente un área.
3. Cada empleado desempeña un solo cargo a la vez.
4. Un área puede tener varios empleados; un cargo puede ser ocupado por varios empleados.
5. La información debe almacenarse evitando la duplicidad innecesaria de datos; el cambio de nombre de un área o cargo se hace una sola vez y se refleja automáticamente en todos los empleados relacionados.
6. La base de datos debe ser SQL Server, con PK e identities, FK y 1 Stored Procedure de consulta de empleados.
7. La API debe ser REST, en C# con .NET 10 y con arquitectura en capas.
8. La API debe usar autenticación Bearer Token con un usuario de prueba preconfigurado.
9. El frontend debe ser React 19 y usar librerías para el diseño de la UI.
10. El listado de empleados debe cargarse al momento de acceder a la pantalla.
11. El registro de nuevo empleado debe presentarse en un modal.
12. La búsqueda en el frontend es "por coincidencias" por el departamento al que pertenece el empleado.
13. Documento confidencial, clasificado como "Restricted to ProCreditGroup".

## 9. Acceptance criteria

Derivados uno a uno de los requisitos explícitos:

- **AC-01** Existe una base de datos en SQL Server con tablas que tienen PK e identities.
- **AC-02** Las relaciones entre tablas están implementadas con FK.
- **AC-03** Existe al menos un Stored Procedure que permite consultar empleados.
- **AC-04** El modelo evita la duplicidad innecesaria: renombrar un área o un cargo se hace en un solo lugar y queda reflejado para todos los empleados relacionados.
- **AC-05** Un empleado se almacena con documento de identidad único, nombres, apellidos, edad, remuneración mensual, su área y su cargo.
- **AC-06** Existe una API Rest en C# / .NET 10 organizada en capas.
- **AC-07** La API expone autenticación Bearer Token y permite autenticarse con el usuario de prueba preconfigurado.
- **AC-08** La API expone un servicio que lista todos los empleados.
- **AC-09** La API expone un servicio que agrega nuevos empleados.
- **AC-10** La API expone un servicio de búsqueda filtrada por departamento.
- **AC-11** La aplicación React 19 presenta un formulario de Login.
- **AC-12** La aplicación muestra el listado de todos los empleados en una tabla, cargado automáticamente al acceder a la pantalla, consumiendo el servicio de la API.
- **AC-13** La aplicación permite registrar un nuevo empleado mediante un formulario en un modal.
- **AC-14** La aplicación permite buscar empleados por coincidencias del departamento al que pertenecen, consumiendo el servicio correspondiente de la API.
- **AC-15** La UI está construida con librerías de diseño de UI.

## 10. Open questions or ambiguities

1. **"Área" vs. "departamento"**: el enunciado describe la organización en *áreas funcionales*, pero los servicios de búsqueda hablan de *departamento*. ¿Son el mismo concepto o entidades distintas?
2. **Búsqueda "filtrada" (API) vs. "por coincidencias" (UI)**: no se especifica si el filtro es por identificador de departamento, por nombre exacto o por coincidencia parcial de texto; tampoco si es sensible a mayúsculas/acentos.
3. **Atributos exactos del Empleado**: se mencionan documento de identidad, nombres, apellidos, edad y remuneración mensual. No se indica si "información personal" incluye campos adicionales (fecha de nacimiento, dirección, correo, teléfono, fecha de ingreso, estado activo/inactivo).
4. **Edad vs. fecha de nacimiento**: el reto pide "edad"; no aclara si debe almacenarse como dato o calcularse.
5. **Remuneración mensual**: no se define moneda, precisión decimal, ni si debe restringirse su visibilidad (Nómina) frente a otros usuarios.
6. **Reportes de Nómina**: se mencionan reportes de gastos, promedios salariales y análisis de costos por área como necesidad de negocio, pero no aparecen entre los servicios ni pantallas requeridos. ¿Están dentro del alcance?
7. **Stored Procedure**: no se precisa qué consulta debe resolver (listado completo, filtrado por departamento, o ambos) ni si los servicios de la API deben consumirlo obligatoriamente.
8. **Gestión de áreas y cargos**: no se solicitan servicios ni pantallas de ABM (alta/baja/modificación) para áreas y cargos, aunque el objetivo de "cambiar el nombre una sola vez" los presupone. ¿Se limitan a datos precargados?
9. **Usuario de prueba preconfigurado**: no se define su origen (tabla de usuarios, configuración en código/appsettings), credenciales, ni si debe existir gestión de usuarios o roles.
10. **Bearer Token**: no se especifica el estándar (p. ej. JWT), el emisor, la expiración ni el refresco del token.
11. **Alcance CRUD**: solo se piden listar, agregar y buscar. No se solicita edición ni eliminación de empleados.
12. **Validaciones y errores**: no se definen reglas de validación (rango de edad, formato de documento, unicidad al registrar) ni el comportamiento esperado ante errores.
13. **Paginación / volumen**: el listado pide "todos los empleados", sin mención de paginación u ordenamiento.
14. **Entrega y evaluación**: no se indica en el texto extraído la forma de entrega (repositorio, empaquetado), plazo, ni criterios de puntuación.
15. **Librería de UI**: se exige "utilizar librerías para el diseño de la UI" sin nombrar ninguna en particular.
16. **.NET 10 / React 19**: no se aclara si se aceptan versiones alternativas en caso de indisponibilidad del entorno.
