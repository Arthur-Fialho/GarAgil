using FluentAssertions;
using GarAgil.Application.Communication;
using GarAgil.Domain.Communication;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Application.Communication;

public class PredictiveMaintenanceTests
{
    [Fact]
    public async Task EvaluateVehicle_WhenMaintenanceIsDueSoon_ShouldCreateNotification()
    {
        // Arrange
        var mockAi = new Mock<IPredictiveMaintenanceAi>();
        var vehiclePlate = "DEF-5678";
        var currentMileage = 60000;
        var customerPhone = "+5531999999999";
        
        // Mock the AI predicting maintenance is due in 3 days
        var predictedDate = DateTime.UtcNow.AddDays(3);
        mockAi.Setup(ai => ai.PredictNextMaintenanceDateAsync(vehiclePlate, currentMileage))
              .ReturnsAsync(predictedDate);

        var notifierService = new MaintenanceNotifierService(mockAi.Object);

        // Act
        var notification = await notifierService.EvaluateAndNotifyAsync(vehiclePlate, currentMileage, customerPhone);

        // Assert
        notification.Should().NotBeNull();
        notification!.CustomerPhone.Should().Be(customerPhone);
        notification.Message.Should().Contain(vehiclePlate);
    }
    
    [Fact]
    public async Task EvaluateVehicle_WhenMaintenanceIsNotDue_ShouldReturnNull()
    {
        // Arrange
        var mockAi = new Mock<IPredictiveMaintenanceAi>();
        var vehiclePlate = "DEF-5678";
        
        // Mock the AI predicting maintenance is due in 60 days
        var predictedDate = DateTime.UtcNow.AddDays(60);
        mockAi.Setup(ai => ai.PredictNextMaintenanceDateAsync(vehiclePlate, 60000))
              .ReturnsAsync(predictedDate);

        var notifierService = new MaintenanceNotifierService(mockAi.Object);

        // Act
        var notification = await notifierService.EvaluateAndNotifyAsync(vehiclePlate, 60000, "+5531999999999");

        // Assert
        notification.Should().BeNull(); // No notification needed yet
    }
}
