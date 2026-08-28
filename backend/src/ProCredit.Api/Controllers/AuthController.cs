using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Dtos;
using ProCredit.Application.Services;

namespace ProCredit.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var response = authService.Autenticar(request);
        return response is null
            ? Problem(statusCode: StatusCodes.Status401Unauthorized, detail: "Credenciales invalidas.")
            : Ok(response);
    }
}
