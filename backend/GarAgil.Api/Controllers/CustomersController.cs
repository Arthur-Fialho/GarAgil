using GarAgil.Domain.CRM;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public CustomersController(GarAgilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _context.Customers.Include(c => c.Vehicles).ToListAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        if (request == null)
            return BadRequest();

        var customer = new Customer(request.Name, request.Document, request.Email, request.Phone);

        if (!string.IsNullOrEmpty(request.Cep))
        {
            customer.UpdateAddress(request.Cep, request.Street, request.Number, request.Neighborhood, request.City, request.State);
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateCustomer), new { id = customer.Id }, customer);
    }

    [HttpPost("{id}/vehicles")]
    public async Task<IActionResult> AddVehicle(Guid id, [FromBody] AddVehicleRequest request)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        customer.AddVehicle(request.Plate, request.Model);
        await _context.SaveChangesAsync();

        return Ok(customer);
    }
}

public class AddVehicleRequest
{
    public string Plate { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}

public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
}
