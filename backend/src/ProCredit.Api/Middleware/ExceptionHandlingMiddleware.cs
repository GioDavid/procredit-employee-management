using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Exceptions;

namespace ProCredit.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ConflictoException ex)
        {
            await EscribirProblema(context, StatusCodes.Status409Conflict, "Conflicto", ex.Message);
        }
        catch (ReglaNegocioException ex)
        {
            await EscribirProblema(context, StatusCodes.Status400BadRequest, "Solicitud invalida", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado procesando {Path}", context.Request.Path);
            await EscribirProblema(context, StatusCodes.Status500InternalServerError,
                "Error interno", "Ocurrio un error inesperado.");
        }
    }

    private static async Task EscribirProblema(HttpContext context, int statusCode, string title, string detail)
    {
        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem);
    }
}
