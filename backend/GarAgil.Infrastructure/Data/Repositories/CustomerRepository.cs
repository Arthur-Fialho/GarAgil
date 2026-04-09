using GarAgil.Domain.CRM;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Infrastructure.Data.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly GarAgilDbContext _context;

    public CustomerRepository(GarAgilDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await _context.Customers.Include(c => c.Vehicles).ToListAsync();
    }

    public async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _context.Customers.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Customers.AnyAsync(c => c.Id == id);
    }

    public async Task AddAsync(Customer customer)
    {
        _context.Customers.Add(customer);
        await Task.CompletedTask;
    }

    public async Task RemoveAsync(Customer customer)
    {
        _context.Customers.Remove(customer);
        await Task.CompletedTask;
    }

    public async Task AddVehicleAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
