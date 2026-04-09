using GarAgil.Domain.Inventory;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public InventoryController(GarAgilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetParts()
    {
        var parts = await _context.Parts.ToListAsync();
        return Ok(parts);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePart([FromBody] CreatePartRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Sku))
            return BadRequest(new { message = "Nome e SKU são obrigatórios." });

        var part = new Part(request.Name, request.Sku, request.CostPrice, request.SellingPrice, request.InitialStock);
        _context.Parts.Add(part);
        await _context.SaveChangesAsync();
        return Ok(part);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePart(Guid id, [FromBody] UpdatePartRequest request)
    {
        var part = await _context.Parts.FindAsync(id);
        if (part == null) return NotFound();

        part.Update(request.Name, request.Sku, request.CostPrice, request.SellingPrice);
        await _context.SaveChangesAsync();
        return Ok(part);
    }

    [HttpPost("{id}/add-stock")]
    public async Task<IActionResult> AddStock(Guid id, [FromBody] StockActionRequest request)
    {
        var part = await _context.Parts.FindAsync(id);
        if (part == null) return NotFound();

        part.AddStock(request.Quantity);
        await _context.SaveChangesAsync();
        return Ok(part);
    }

    [HttpPost("{id}/remove-stock")]
    public async Task<IActionResult> RemoveStock(Guid id, [FromBody] StockActionRequest request)
    {
        var part = await _context.Parts.FindAsync(id);
        if (part == null) return NotFound();

        part.RemoveStock(request.Quantity);
        await _context.SaveChangesAsync();
        return Ok(part);
    }
}

public class CreatePartRequest
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int InitialStock { get; set; }
}

public class UpdatePartRequest
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
}

public class StockActionRequest
{
    public int Quantity { get; set; }
}
