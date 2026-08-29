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
        catch (ConflictException ex)
        {
            await WriteProblem(context, StatusCodes.Status409Conflict, "Conflicto", ex.Message);
        }
        catch (BusinessRuleException ex)
        {
            await WriteProblem(context, StatusCodes.Status400BadRequest, "Solicitud invalida", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled error processing {Path}", context.Request.Path);
            await WriteProblem(context, StatusCodes.Status500InternalServerError,
                "Error interno", "Ocurrio un error inesperado.");
        }
    }

    private static async Task WriteProblem(HttpContext context, int statusCode, string title, string detail)
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
