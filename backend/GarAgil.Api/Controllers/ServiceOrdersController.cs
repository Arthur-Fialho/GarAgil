using GarAgil.Domain.Workflow;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace GarAgil.Api.Controllers;

[Authorize]
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
        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServiceOrder([FromBody] CreateServiceOrderRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.VehiclePlate) || string.IsNullOrWhiteSpace(request.VehicleModel))
            return BadRequest();

        var order = new ServiceOrder(request.VehiclePlate, request.VehicleModel, request.Description);

        _context.ServiceOrders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceOrders), new { id = order.Id }, order);
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
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
            // 1. Finalize the current order (Technical finalization)
            order.RequestAdditionalRepair(request.Notes);
            order.EmitNf(); // Auto-emit for internal transition
            order.FinalizeOrder();

            // 2. Create the NEW order for the same vehicle (The follow-up)
            var newOrder = new ServiceOrder(order.VehiclePlate, order.VehicleModel, request.Notes);
            _context.ServiceOrders.Add(newOrder);

            await _context.SaveChangesAsync();
            return Ok(newOrder);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
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
            // Simple hack to toggle for the prototype since property is private set
            // In a real app we'd have a method in the entity
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

public class MechanicActionRequest
{
    public string Notes { get; set; } = string.Empty;
}

public class CreateServiceOrderRequest
{
    public string VehiclePlate { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    public int Status { get; set; }
}
