using GarAgil.Domain.CRM;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        if (request == null)
            return BadRequest();

        var customer = new Customer(request.Name, request.Document, request.Email, request.Phone);

        if (!string.IsNullOrEmpty(request.Cep))
        {
            customer.UpdateAddress(request.Cep, request.Street, request.Neighborhood, request.City, request.State);
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateCustomer), new { id = customer.Id }, customer);
    }
}

public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
}
