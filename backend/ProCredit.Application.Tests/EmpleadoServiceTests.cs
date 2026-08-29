using ProCredit.Application.Dtos;
using ProCredit.Application.Exceptions;
using ProCredit.Application.Services;
using ProCredit.Application.Tests.Fakes;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests;

public sealed class EmpleadoServiceTests
{
    private static readonly Departamento DepartamentoSistemas = new()
    {
        DepartamentoId = 1,
        Nombre = "Sistemas"
    };

    private static readonly Cargo CargoEspecialista = new()
    {
        CargoId = 1,
        Nombre = "Especialista de Sistemas"
    };

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task ConsultarAsync_CuandoDepartamentoEsNuloOVacio_ConsultaSinFiltroYMapeaEmpleados(
        string? departamento)
    {
        var empleadoRepository = new FakeEmpleadoRepository
        {
            EmpleadosConsulta =
            [
                new Empleado
                {
                    EmpleadoId = 10,
                    NumeroDocumento = "12345678",
                    Nombres = "Ana María",
                    Apellidos = "Pérez Rojas",
                    Edad = 34,
                    RemuneracionMensual = 4500.00m,
                    DepartamentoId = 1,
                    Departamento = "Sistemas",
                    CargoId = 1,
                    Cargo = "Especialista de Sistemas"
                }
            ]
        };
        var sut = new EmpleadoService(empleadoRepository, new FakeCatalogoRepository());

        var resultado = await sut.ConsultarAsync(departamento, CancellationToken.None);

        Assert.Equal(departamento, empleadoRepository.DepartamentoConsultado);
        var dto = Assert.Single(resultado);
        Assert.Equal(10, dto.EmpleadoId);
        Assert.Equal("12345678", dto.NumeroDocumento);
        Assert.Equal("Ana María", dto.Nombres);
        Assert.Equal("Pérez Rojas", dto.Apellidos);
        Assert.Equal(34, dto.Edad);
        Assert.Equal(4500.00m, dto.RemuneracionMensual);
        Assert.Equal(1, dto.DepartamentoId);
        Assert.Equal("Sistemas", dto.Departamento);
        Assert.Equal(1, dto.CargoId);
        Assert.Equal("Especialista de Sistemas", dto.Cargo);
    }

    [Fact]
    public async Task ConsultarAsync_CuandoHayDepartamento_LoReenviaAlRepositorio()
    {
        var empleadoRepository = new FakeEmpleadoRepository();
        var sut = new EmpleadoService(empleadoRepository, new FakeCatalogoRepository());

        await sut.ConsultarAsync("Sistemas", CancellationToken.None);

        Assert.Equal("Sistemas", empleadoRepository.DepartamentoConsultado);
    }

    [Fact]
    public async Task AgregarAsync_ConDatosValidos_PersisteYRetornaEmpleadoCreado()
    {
        var empleadoRepository = new FakeEmpleadoRepository { ProximoId = 42 };
        var catalogoRepository = CatalogosValidos();
        var sut = new EmpleadoService(empleadoRepository, catalogoRepository);
        var request = new CrearEmpleadoRequest
        {
            NumeroDocumento = "  12345678  ",
            Nombres = "  Ana María  ",
            Apellidos = "  Pérez Rojas  ",
            Edad = 34,
            RemuneracionMensual = 4500.00m,
            DepartamentoId = 1,
            CargoId = 1
        };

        var dto = await sut.AgregarAsync(request, CancellationToken.None);

        Assert.Equal("12345678", empleadoRepository.DocumentoConsultado);
        Assert.NotNull(empleadoRepository.EmpleadoAgregado);
        Assert.Equal("12345678", empleadoRepository.EmpleadoAgregado.NumeroDocumento);
        Assert.Equal("Ana María", empleadoRepository.EmpleadoAgregado.Nombres);
        Assert.Equal("Pérez Rojas", empleadoRepository.EmpleadoAgregado.Apellidos);
        Assert.Equal(42, dto.EmpleadoId);
        Assert.Equal("12345678", dto.NumeroDocumento);
        Assert.Equal("Ana María", dto.Nombres);
        Assert.Equal("Pérez Rojas", dto.Apellidos);
        Assert.Equal(34, dto.Edad);
        Assert.Equal(4500.00m, dto.RemuneracionMensual);
        Assert.Equal(1, dto.DepartamentoId);
        Assert.Equal("Sistemas", dto.Departamento);
        Assert.Equal(1, dto.CargoId);
        Assert.Equal("Especialista de Sistemas", dto.Cargo);
    }

    [Fact]
    public async Task AgregarAsync_CuandoDocumentoYaExiste_LanzaConflictoException()
    {
        var empleadoRepository = new FakeEmpleadoRepository { ExisteDocumento = true };
        var sut = new EmpleadoService(empleadoRepository, CatalogosValidos());
        var request = RequestValido();

        var ex = await Assert.ThrowsAsync<ConflictoException>(
            () => sut.AgregarAsync(request, CancellationToken.None));

        Assert.Contains("12345678", ex.Message);
        Assert.Null(empleadoRepository.EmpleadoAgregado);
    }

    [Fact]
    public async Task AgregarAsync_CuandoDepartamentoNoExiste_LanzaReglaNegocioException()
    {
        var empleadoRepository = new FakeEmpleadoRepository();
        var catalogoRepository = new FakeCatalogoRepository
        {
            Departamentos = [new Departamento { DepartamentoId = 2, Nombre = "Finanzas" }],
            Cargos = [CargoEspecialista]
        };
        var sut = new EmpleadoService(empleadoRepository, catalogoRepository);

        var ex = await Assert.ThrowsAsync<ReglaNegocioException>(
            () => sut.AgregarAsync(RequestValido(), CancellationToken.None));

        Assert.Contains("departamento", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(empleadoRepository.EmpleadoAgregado);
        Assert.IsNotType<ConflictoException>(ex);
    }

    [Fact]
    public async Task AgregarAsync_CuandoCargoNoExiste_LanzaReglaNegocioException()
    {
        var empleadoRepository = new FakeEmpleadoRepository();
        var catalogoRepository = new FakeCatalogoRepository
        {
            Departamentos = [DepartamentoSistemas],
            Cargos = [new Cargo { CargoId = 2, Nombre = "Contador Senior" }]
        };
        var sut = new EmpleadoService(empleadoRepository, catalogoRepository);

        var ex = await Assert.ThrowsAsync<ReglaNegocioException>(
            () => sut.AgregarAsync(RequestValido(), CancellationToken.None));

        Assert.Contains("cargo", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(empleadoRepository.EmpleadoAgregado);
        Assert.IsNotType<ConflictoException>(ex);
    }

    private static FakeCatalogoRepository CatalogosValidos() => new()
    {
        Departamentos = [DepartamentoSistemas],
        Cargos = [CargoEspecialista]
    };

    private static CrearEmpleadoRequest RequestValido() => new()
    {
        NumeroDocumento = "12345678",
        Nombres = "Ana María",
        Apellidos = "Pérez Rojas",
        Edad = 34,
        RemuneracionMensual = 4500.00m,
        DepartamentoId = 1,
        CargoId = 1
    };
}
