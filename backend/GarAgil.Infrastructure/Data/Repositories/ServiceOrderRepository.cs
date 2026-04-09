using GarAgil.Domain.Workflow;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Infrastructure.Data.Repositories;

public class ServiceOrderRepository : IServiceOrderRepository
{
    private readonly GarAgilDbContext _context;

    public ServiceOrderRepository(GarAgilDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ServiceOrder>> GetAllAsync()
    {
        return await _context.ServiceOrders.Include(o => o.Tasks).ToListAsync();
    }

    public async Task<ServiceOrder?> GetByIdAsync(Guid id)
    {
        return await _context.ServiceOrders.Include(o => o.Tasks).FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<bool> HasOpenOrderForVehicleAsync(string vehiclePlate)
    {
        return await _context.ServiceOrders.AnyAsync(o => 
            o.VehiclePlate == vehiclePlate && 
            o.Status != ServiceOrderStatus.Finalizado && 
            o.Status != ServiceOrderStatus.Cancelado);
    }

    public async Task AddAsync(ServiceOrder order)
    {
        _context.ServiceOrders.Add(order);
        await Task.CompletedTask;
    }

    public async Task AddTaskAsync(ServiceOrderTask task)
    {
        _context.ServiceOrderTasks.Add(task);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
