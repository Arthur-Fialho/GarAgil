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
        var orders = await _context.ServiceOrders.Include(o => o.Tasks).ToListAsync();
        
        // Fetch all historical completed tasks for these vehicles to show persistence on cards
        var plates = orders.Select(o => o.VehiclePlate).Distinct().ToList();
        var allPastTasks = await _context.ServiceOrderTasks
            .Where(t => t.IsCompleted && _context.ServiceOrders
                .Where(so => plates.Contains(so.VehiclePlate))
                .Select(so => so.Id).Contains(t.ServiceOrderId))
            .ToListAsync();

        foreach (var order in orders)
        {
            // Get completed tasks from other OS of the same plate
            var historicalTasks = allPastTasks
                .Where(t => t.ServiceOrderId != order.Id && 
                           _context.ServiceOrders.Any(so => so.Id == t.ServiceOrderId && so.VehiclePlate == order.VehiclePlate))
                .ToList();

            // We combine them for the UI display (using a simple logic for the prototype)
            // In a real app we might want a separate 'History' property in the DTO
            var currentTasks = order.Tasks.ToList();
            var combined = historicalTasks.Concat(currentTasks).OrderBy(t => t.CreatedAt).ToList();
            
            // Temporary hack: use reflection to update the private backing field for the prototype display
            var field = typeof(ServiceOrder).GetField("_tasks", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            field?.SetValue(order, combined);
        }

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var customer = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServiceOrder([FromBody] CreateServiceOrderRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.VehiclePlate) || string.IsNullOrWhiteSpace(request.VehicleModel))
            return BadRequest();

        // Handle both old 'Description' field and new 'Descriptions' list for backward compatibility
        var initialTasks = request.Descriptions != null && request.Descriptions.Any() 
            ? request.Descriptions 
            : new List<string> { request.Description };

        // Create OS with the FIRST description
        var order = new ServiceOrder(request.VehiclePlate, request.VehicleModel, initialTasks.First());

        // Add the REST of the descriptions as tasks using the official domain method
        foreach (var desc in initialTasks.Skip(1))
        {
            order.AddTask(desc);
        }

        _context.ServiceOrders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = order.Id }, order);
    }

    [HttpPost("{id}/tasks")]
    public async Task<IActionResult> AddTask(Guid id, [FromBody] AddTaskRequest request)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        var newTask = new ServiceOrderTask(request.Description, id);
        _context.ServiceOrderTasks.Add(newTask);
        
        await _context.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound();

        try
        {
            if (request.Status == (int)ServiceOrderStatus.Finalizado)
            {
                order.FinalizeOrder();
            }
            else if (request.Status == (int)ServiceOrderStatus.Cancelado)
            {
                order.CancelOrder();
            }
            else
            {
                order.UpdateStatus((ServiceOrderStatus)request.Status);
            }
            
            await _context.SaveChangesAsync();
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id}/emit-nf")]
    public async Task<IActionResult> EmitNf(Guid id)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound();

        try
        {
            order.EmitNf();
            await _context.SaveChangesAsync();
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id}/finish-maintenance")]
    public async Task<IActionResult> FinishMaintenance(Guid id, [FromBody] MechanicActionRequest request)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound();

        try
        {
            order.FinishMaintenance(request.Notes);
            await _context.SaveChangesAsync();
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id}/additional-repair")]
    public async Task<IActionResult> AdditionalRepair(Guid id, [FromBody] MechanicActionRequest request)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound();

        try
        {
            if (request.FinishCurrent)
            {
                order.FinishMaintenance("Serviço concluído. Novo reparo solicitado: " + request.Notes);
                order.EmitNf(); 
                order.FinalizeOrder();
            }

            var newOrder = new ServiceOrder(order.VehiclePlate, order.VehicleModel, request.Notes);
            _context.ServiceOrders.Add(newOrder);

            await _context.SaveChangesAsync();
            return Ok(newOrder);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpPatch("{id}/tasks/{taskId}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid id, Guid taskId)
    {
        var order = await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        var task = order.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null) return NotFound();

        if (task.IsCompleted)
        {
            typeof(ServiceOrderTask).GetProperty("IsCompleted")?.SetValue(task, false);
        }
        else
        {
            task.MarkAsCompleted();
        }

        await _context.SaveChangesAsync();
        return Ok(order);
    }
}

public class CreateServiceOrderRequest
{
    public string VehiclePlate { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string>? Descriptions { get; set; }
}

public class AddTaskRequest
{
    public string Description { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    public int Status { get; set; }
}

public class MechanicActionRequest
{
    public string Notes { get; set; } = string.Empty;
    public bool FinishCurrent { get; set; }
}
