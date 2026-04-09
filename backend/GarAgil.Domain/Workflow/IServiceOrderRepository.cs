using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Domain.Workflow;

public interface IServiceOrderRepository
{
    Task<IEnumerable<ServiceOrder>> GetAllAsync();
    Task<ServiceOrder?> GetByIdAsync(Guid id);
    Task<bool> HasOpenOrderForVehicleAsync(string vehiclePlate);
    Task AddAsync(ServiceOrder order);
    Task AddTaskAsync(ServiceOrderTask task);
    Task SaveChangesAsync();
}
