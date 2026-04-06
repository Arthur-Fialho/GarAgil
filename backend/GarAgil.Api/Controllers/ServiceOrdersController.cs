using GarAgil.Domain.Workflow;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceOrdersController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public ServiceOrdersController(GarAgilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetServiceOrders()
    {
        var orders = await _context.ServiceOrders.ToListAsync();
        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServiceOrder([FromBody] CreateServiceOrderRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.VehiclePlate))
            return BadRequest();

        var order = new ServiceOrder(request.VehiclePlate, request.Description);

        _context.ServiceOrders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceOrders), new { id = order.Id }, order);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _context.ServiceOrders.FindAsync(id);
        if (order == null)
            return NotFound();

        order.UpdateStatus((ServiceOrderStatus)request.Status);
        await _context.SaveChangesAsync();

        return Ok(order);
    }
}

public class CreateServiceOrderRequest
{
    public string VehiclePlate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    public int Status { get; set; }
}
