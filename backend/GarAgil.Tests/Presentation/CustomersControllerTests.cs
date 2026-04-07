using FluentAssertions;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;

namespace GarAgil.Tests.Presentation;

public class CustomersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CustomersControllerTests(WebApplicationFactory<Program> factory)
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
                    options.UseInMemoryDatabase("GarAgil_ApiTestDb");
                });

                services.AddAuthentication(TestAuthHandler.DefaultScheme)
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.DefaultScheme, options => { });
                
                services.AddControllers(options =>
                {
                    var policy = new AuthorizationPolicyBuilder(TestAuthHandler.DefaultScheme)
                        .RequireAuthenticatedUser()
                        .Build();
                    options.Filters.Add(new AuthorizeFilter(policy));
                });
            });
        });
    }

    [Fact]
    public async Task PostCustomer_WhenValidData_ShouldReturnCreated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new
        {
            Name = "Empresa X",
            Document = "12.345.678/0001-90",
            Email = "contato@empresax.com",
            Phone = "(11) 98888-8888"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/customers", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Empresa X");
    }
}
