using FluentAssertions;
using GarAgil.Domain.Workflow;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using GarAgil.Infrastructure.Data;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;
using System.Linq;

using Microsoft.EntityFrameworkCore;

namespace GarAgil.Tests.Presentation;

public class ServiceOrdersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ServiceOrdersControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<GarAgilDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<GarAgilDbContext>(options =>
                {
                    options.UseInMemoryDatabase("GarAgil_ApiTestDb_ServiceOrders");
                });
            });
        });
    }

    [Fact]
    public async Task GetServiceOrders_ShouldReturnList()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/serviceorders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var orders = await response.Content.ReadFromJsonAsync<List<ServiceOrderDto>>();
        orders.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateServiceOrder_ShouldReturnCreated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new
        {
            VehiclePlate = "KBM-1234",
            Description = "Troca de disco de freio"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/serviceorders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("KBM-1234");
    }

    [Fact]
    public async Task UpdateStatus_ShouldReturnOk_WhenValidTransition()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createRequest = new
        {
            VehiclePlate = "AAA-1111",
            Description = "Revisão geral"
        };
        var createResponse = await client.PostAsJsonAsync("/api/serviceorders", createRequest);
        var createdOrder = await createResponse.Content.ReadFromJsonAsync<ServiceOrderDto>();

        var updateRequest = new { Status = (int)ServiceOrderStatus.Aprovado };

        // Act
        var response = await client.PatchAsJsonAsync($"/api/serviceorders/{createdOrder!.Id}/status", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedOrder = await response.Content.ReadFromJsonAsync<ServiceOrderDto>();
        updatedOrder!.Status.Should().Be((int)ServiceOrderStatus.Aprovado);
    }
}

public class ServiceOrderDto
{
    public System.Guid Id { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Status { get; set; }
}
