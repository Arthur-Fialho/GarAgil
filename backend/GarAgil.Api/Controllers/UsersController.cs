using GarAgil.Domain.Auth;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public UsersController(GarAgilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.Status,
                u.CreatedAt
            })
            .ToListAsync();
            
        return Ok(users);
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        user.Approve();
        await _context.SaveChangesAsync();
        return Ok(new { message = "Usuário aprovado com sucesso." });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        user.Reject();
        await _context.SaveChangesAsync();
        return Ok(new { message = "Usuário rejeitado." });
    }
}
