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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        if (request == null)
            return BadRequest();

        var customer = new Customer(request.Name, request.Document, request.Email, request.Phone);

        if (!string.IsNullOrEmpty(request.Cep))
        {
            customer.UpdateAddress(request.Cep, request.Street ?? "", request.Number ?? "", request.Neighborhood ?? "", request.City ?? "", request.State ?? "");
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPost("{id}/vehicles")]
    public async Task<IActionResult> AddVehicle(Guid id, [FromBody] AddVehicleRequest request)
    {
        var customerExists = await _context.Customers.AnyAsync(c => c.Id == id);
        if (!customerExists)
            return NotFound();

        var vehicle = new Vehicle(request.Plate, request.Model, id);
        _context.Vehicles.Add(vehicle);
        
        await _context.SaveChangesAsync();

        // Return the updated customer with all vehicles
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        return Ok(customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        try
        {
            customer.UpdateDetails(request.Name, request.Document, request.Email ?? "", request.Phone ?? "");
            
            if (!string.IsNullOrEmpty(request.Cep))
            {
                customer.UpdateAddress(request.Cep, request.Street ?? "", request.Number ?? "", request.Neighborhood ?? "", request.City ?? "", request.State ?? "");
            }

            await _context.SaveChangesAsync();
            return Ok(customer);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> UpdateVehicle(Guid id, Guid vehicleId, [FromBody] UpdateVehicleRequest request)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        var vehicle = customer.Vehicles.FirstOrDefault(v => v.Id == vehicleId);
        if (vehicle == null)
            return NotFound();

        try
        {
            vehicle.Update(request.Plate, request.Model);
            await _context.SaveChangesAsync();
            return Ok(customer);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> RemoveVehicle(Guid id, Guid vehicleId)
    {
        var customer = await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        customer.RemoveVehicle(vehicleId);
        await _context.SaveChangesAsync();

        return Ok(customer);
    }
}

public class UpdateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Cep { get; set; }
    public string? Street { get; set; }
    public string? Number { get; set; }
    public string? Neighborhood { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
}

public class UpdateVehicleRequest
{
    public string Plate { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
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
