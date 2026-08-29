using System.ComponentModel.DataAnnotations;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Tests;

public sealed class CrearEmpleadoRequestValidationTests
{
    [Fact]
    public void Validar_ConDatosValidos_NoProduceErrores()
    {
        var request = RequestValido();

        var resultados = Validar(request);

        Assert.Empty(resultados);
    }

    [Fact]
    public void Validar_CuandoNumeroDocumentoEsCorto_ProduceError()
    {
        var request = RequestValido(numeroDocumento: "12345");

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.NumeroDocumento)));
    }

    [Fact]
    public void Validar_CuandoNumeroDocumentoEsLargo_ProduceError()
    {
        var request = RequestValido(numeroDocumento: new string('1', 21));

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.NumeroDocumento)));
    }

    [Fact]
    public void Validar_CuandoNombresEstaVacio_ProduceError()
    {
        var request = RequestValido(nombres: "");

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.Nombres)));
    }

    [Fact]
    public void Validar_CuandoApellidosEstaVacio_ProduceError()
    {
        var request = RequestValido(apellidos: "");

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.Apellidos)));
    }

    [Fact]
    public void Validar_CuandoEdadEsMenorA18_ProduceError()
    {
        var request = RequestValido(edad: 17);

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.Edad)));
    }

    [Fact]
    public void Validar_CuandoEdadEsMayorA100_ProduceError()
    {
        var request = RequestValido(edad: 101);

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.Edad)));
    }

    [Fact]
    public void Validar_CuandoRemuneracionNoEsMayorQueCero_ProduceError()
    {
        var request = RequestValido(remuneracionMensual: 0m);

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.RemuneracionMensual)));
    }

    [Fact]
    public void Validar_CuandoDepartamentoIdEsMenorA1_ProduceError()
    {
        var request = RequestValido(departamentoId: 0);

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.DepartamentoId)));
    }

    [Fact]
    public void Validar_CuandoCargoIdEsMenorA1_ProduceError()
    {
        var request = RequestValido(cargoId: 0);

        var resultados = Validar(request);

        Assert.Contains(resultados, r => TieneMiembro(r, nameof(CrearEmpleadoRequest.CargoId)));
    }

    private static CrearEmpleadoRequest RequestValido(
        string numeroDocumento = "12345678",
        string nombres = "Ana María",
        string apellidos = "Pérez Rojas",
        int edad = 34,
        decimal remuneracionMensual = 4500.00m,
        int departamentoId = 1,
        int cargoId = 1) => new()
    {
        NumeroDocumento = numeroDocumento,
        Nombres = nombres,
        Apellidos = apellidos,
        Edad = edad,
        RemuneracionMensual = remuneracionMensual,
        DepartamentoId = departamentoId,
        CargoId = cargoId
    };

    private static List<ValidationResult> Validar(CrearEmpleadoRequest request)
    {
        var resultados = new List<ValidationResult>();
        var contexto = new ValidationContext(request);
        Validator.TryValidateObject(request, contexto, resultados, validateAllProperties: true);
        return resultados;
    }

    private static bool TieneMiembro(ValidationResult resultado, string nombreMiembro) =>
        resultado.MemberNames.Contains(nombreMiembro);
}
