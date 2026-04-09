using GarAgil.Domain.CRM;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerRepository _customerRepository;

    public CustomersController(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _customerRepository.GetAllAsync();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
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

        await _customerRepository.AddAsync(customer);
        await _customerRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPost("{id}/vehicles")]
    public async Task<IActionResult> AddVehicle(Guid id, [FromBody] AddVehicleRequest request)
    {
        var customerExists = await _customerRepository.ExistsAsync(id);
        if (!customerExists)
            return NotFound();

        var vehicle = new Vehicle(request.Plate, request.Model, id);
        await _customerRepository.AddVehicleAsync(vehicle);
        
        await _customerRepository.SaveChangesAsync();

        // Return the updated customer with all vehicles
        var customer = await _customerRepository.GetByIdAsync(id);
        return Ok(customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        customer.UpdateDetails(request.Name, request.Document, request.Email ?? "", request.Phone ?? "");
        
        if (!string.IsNullOrEmpty(request.Cep))
        {
            customer.UpdateAddress(request.Cep, request.Street ?? "", request.Number ?? "", request.Neighborhood ?? "", request.City ?? "", request.State ?? "");
        }

        await _customerRepository.SaveChangesAsync();
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        await _customerRepository.RemoveAsync(customer);
        await _customerRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> UpdateVehicle(Guid id, Guid vehicleId, [FromBody] UpdateVehicleRequest request)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        var vehicle = customer.Vehicles.FirstOrDefault(v => v.Id == vehicleId);
        if (vehicle == null)
            return NotFound();

        vehicle.Update(request.Plate, request.Model);
        await _customerRepository.SaveChangesAsync();
        return Ok(customer);
    }

    [HttpDelete("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> RemoveVehicle(Guid id, Guid vehicleId)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        customer.RemoveVehicle(vehicleId);
        await _customerRepository.SaveChangesAsync();

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
