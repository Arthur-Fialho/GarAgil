using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Presentation;

public class DuplicateTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public DuplicateTest(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateServiceOrder_WhenOpenOrderExists_ShouldReturnBadRequest()
    {
        var client = _factory.CreateClient();
        var request1 = new { VehiclePlate = "ABC1234", VehicleModel = "Civic", Description = "First" };
        var request2 = new { VehiclePlate = "ABC1234", VehicleModel = "Civic", Description = "Second" };

        var r1 = await client.PostAsJsonAsync("/api/serviceorders", request1);
        r1.StatusCode.Should().Be(HttpStatusCode.Created);

        var r2 = await client.PostAsJsonAsync("/api/serviceorders", request2);
        r2.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
