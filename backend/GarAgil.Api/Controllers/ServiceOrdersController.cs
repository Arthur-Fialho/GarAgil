using GarAgil.Domain.Workflow;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceOrdersController : ControllerBase
{
    private readonly IServiceOrderRepository _serviceOrderRepository;

    public ServiceOrdersController(IServiceOrderRepository serviceOrderRepository)
    {
        _serviceOrderRepository = serviceOrderRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetServiceOrders()
    {
        var orders = await _serviceOrderRepository.GetAllAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(Guid id)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServiceOrder([FromBody] CreateServiceOrderRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.VehiclePlate) || string.IsNullOrWhiteSpace(request.VehicleModel))
            return BadRequest(new { message = "Placa e Modelo são obrigatórios." });

        var cleanPlate = request.VehiclePlate.Replace("-", "").ToUpper();

        // Check if there is already an open order for this vehicle
        bool hasOpenOrder = await _serviceOrderRepository.HasOpenOrderForVehicleAsync(cleanPlate);

        if (hasOpenOrder)
        {
            return BadRequest(new { message = "Já existe uma ordem de serviço em andamento para este veículo." });
        }

        // Handle both old 'Description' field and new 'Descriptions' list for backward compatibility
        var initialTasks = request.Descriptions != null && request.Descriptions.Any() 
            ? request.Descriptions 
            : new List<string> { request.Description };

        // Create OS with the FIRST description
        var order = new ServiceOrder(cleanPlate, request.VehicleModel, initialTasks.First());

        // Add the REST of the descriptions as tasks using the official domain method
        foreach (var desc in initialTasks.Skip(1))
        {
            order.AddTask(desc);
        }

        await _serviceOrderRepository.AddAsync(order);
        await _serviceOrderRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = order.Id }, order);
    }

    [HttpPost("{id}/tasks")]
    public async Task<IActionResult> AddTask(Guid id, [FromBody] AddTaskRequest request)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null) return NotFound();

        var newTask = new ServiceOrderTask(request.Description, id);
        await _serviceOrderRepository.AddTaskAsync(newTask);
        
        await _serviceOrderRepository.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

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
        
        await _serviceOrderRepository.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("{id}/emit-nf")]
    public async Task<IActionResult> EmitNf(Guid id)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        order.EmitNf();
        await _serviceOrderRepository.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("{id}/finish-maintenance")]
    public async Task<IActionResult> FinishMaintenance(Guid id, [FromBody] MechanicActionRequest request)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        order.FinishMaintenance(request.Notes);
        await _serviceOrderRepository.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("{id}/additional-repair")]
    public async Task<IActionResult> AdditionalRepair(Guid id, [FromBody] MechanicActionRequest request)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        if (request.FinishCurrent)
        {
            order.FinishMaintenance("Serviço concluído. Novo reparo solicitado: " + request.Notes);
            order.EmitNf(); 
            order.FinalizeOrder();
        }

        var newOrder = new ServiceOrder(order.VehiclePlate, order.VehicleModel, request.Notes);
        await _serviceOrderRepository.AddAsync(newOrder);

        await _serviceOrderRepository.SaveChangesAsync();
        return Ok(newOrder);
    }

    [HttpPatch("{id}/tasks/{taskId}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid id, Guid taskId)
    {
        var order = await _serviceOrderRepository.GetByIdAsync(id);
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

        await _serviceOrderRepository.SaveChangesAsync();
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
