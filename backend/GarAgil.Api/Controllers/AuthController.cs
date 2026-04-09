using GarAgil.Domain.Auth;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public AuthController(GarAgilDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email e senha são obrigatórios." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user == null)
            return Unauthorized(new { message = "Email ou senha incorretos." });

        // Verify password
        if (!VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email ou senha incorretos." });

        // Check approval status
        if (user.Status == UserStatus.Pending)
            return Unauthorized(new { message = "Sua conta ainda está aguardando aprovação do Administrador." });
        
        if (user.Status == UserStatus.Rejected)
            return Unauthorized(new { message = "Sua conta foi rejeitada." });

        return GenerateToken(user.Email, user.Name, user.Role);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Nome, email e senha são obrigatórios." });

        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            return BadRequest(new { message = "Este email já está em uso." });

        // Simple bootstrapping rule: The first user ever created is automatically an Admin and Approved
        bool isFirstUser = !await _context.Users.AnyAsync();
        string role = isFirstUser ? "Admin" : "Mechanic";

        var hash = HashPassword(request.Password);
        var user = new User(request.Name, request.Email, hash, role);
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (user.Status == UserStatus.Approved)
        {
            return GenerateToken(user.Email, user.Name, user.Role); // Auto-login for first admin
        }
        else
        {
            return Ok(new { message = "Conta criada com sucesso! Aguarde a aprovação do administrador para fazer login." });
        }
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

    // Very simple hashing for prototype purposes. In production use ASP.NET Core Identity's PasswordHasher or BCrypt.
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLowerInvariant();
        }
    }

    private bool VerifyPassword(string inputPassword, string storedHash)
    {
        return HashPassword(inputPassword) == storedHash;
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
