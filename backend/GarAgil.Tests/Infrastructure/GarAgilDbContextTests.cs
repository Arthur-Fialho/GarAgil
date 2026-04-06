using FluentAssertions;
using GarAgil.Domain.CRM;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Xunit;

// Note: We are using a different namespace until the actual DbContext is created in Infrastructure.
namespace GarAgil.Tests.Infrastructure;

public class GarAgilDbContextTests
{
    [Fact]
    public async Task Can_Save_And_Retrieve_Customer_From_Database()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<GarAgil.Infrastructure.Data.GarAgilDbContext>()
            .UseInMemoryDatabase(databaseName: "GarAgil_TestDb")
            .Options;

        var customer = new Customer("João Teste", "123.456.789-00", "joao@teste.com", "(31) 99999-9999");

        // Act
        using (var context = new GarAgil.Infrastructure.Data.GarAgilDbContext(options))
        {
            context.Customers.Add(customer);
            await context.SaveChangesAsync();
        }

        // Assert
        using (var context = new GarAgil.Infrastructure.Data.GarAgilDbContext(options))
        {
            var savedCustomer = await context.Customers.FirstOrDefaultAsync(c => c.Id == customer.Id);
            
            savedCustomer.Should().NotBeNull();
            savedCustomer!.Name.Should().Be("João Teste");
            savedCustomer.Document.Should().Be("123.456.789-00");
        }
    }
}
