using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Domain.CRM;

public interface ICustomerRepository
{
    Task<IEnumerable<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(Customer customer);
    Task RemoveAsync(Customer customer);
    Task AddVehicleAsync(Vehicle vehicle);
    Task SaveChangesAsync();
}
