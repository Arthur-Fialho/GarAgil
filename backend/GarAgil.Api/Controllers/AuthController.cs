using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GarAgil.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Mock authentication for the prototype
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Unauthorized(new { message = "Email e senha são obrigatórios." });
        }

        if (request.Email == "admin@garagil.com" && request.Password == "admin123")
        {
            return GenerateToken(request.Email, "Admin Oficina", "Admin");
        }

        if (request.Email == "mecanico@garagil.com" && request.Password == "mecanico123")
        {
            return GenerateToken(request.Email, "Mecânico Silva", "Mechanic");
        }

        return Unauthorized(new { message = "Credenciais inválidas." });
    }

    private IActionResult GenerateToken(string email, string name, string role)
    {
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "fallback_secret_key_for_development_purposes_only";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: "GarAgil",
            audience: "GarAgilApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { Token = tokenString, User = new { Name = name, Email = email, Role = role } });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
