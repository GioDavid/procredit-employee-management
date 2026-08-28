namespace ProCredit.Application.Dtos;

public sealed record EmpleadoDto(
    int EmpleadoId,
    string NumeroDocumento,
    string Nombres,
    string Apellidos,
    int Edad,
    decimal RemuneracionMensual,
    int DepartamentoId,
    string Departamento,
    int CargoId,
    string Cargo);
