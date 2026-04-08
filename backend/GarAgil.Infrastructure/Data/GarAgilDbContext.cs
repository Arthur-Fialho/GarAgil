using GarAgil.Domain.CRM;
using GarAgil.Domain.Financial;
using GarAgil.Domain.Inventory;
using GarAgil.Domain.Workflow;
using Microsoft.EntityFrameworkCore;

namespace GarAgil.Infrastructure.Data;

public class GarAgilDbContext : DbContext
{
    public GarAgilDbContext(DbContextOptions<GarAgilDbContext> options) : base(options) { }

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<ServiceOrder> ServiceOrders { get; set; } = null!;
    public DbSet<Part> Parts { get; set; } = null!;
    public DbSet<PayableAccount> PayableAccounts { get; set; } = null!;
    public DbSet<Vehicle> Vehicles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Simple mappings for Phase 1. 
        modelBuilder.Entity<Customer>().HasKey(c => c.Id);
        
        // Configure backing field for DDD encapsulation
        var navigation = modelBuilder.Entity<Customer>().Metadata.FindNavigation(nameof(Customer.Vehicles));
        navigation?.SetPropertyAccessMode(PropertyAccessMode.Field);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Vehicles)
            .WithOne()
            .HasForeignKey(v => v.CustomerId);
        
        modelBuilder.Entity<Vehicle>().HasKey(v => v.Id);
        modelBuilder.Entity<ServiceOrder>().HasKey(s => s.Id);
        modelBuilder.Entity<Part>().HasKey(p => p.Id);
        modelBuilder.Entity<PayableAccount>().HasKey(p => p.Id);
    }
}
