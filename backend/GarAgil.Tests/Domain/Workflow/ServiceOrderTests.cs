using FluentAssertions;
using GarAgil.Domain.Workflow;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Workflow;

public class ServiceOrderTests
{
    [Fact]
    public void Constructor_WhenCreated_ShouldHaveEstimateStatus()
    {
        // Arrange
        var vehiclePlate = "ABC-1234";
        var description = "Troca de óleo e filtro";

        // Act
        var serviceOrder = new ServiceOrder(vehiclePlate, description);

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Orcamento);
    }

    [Fact]
    public void Approve_WhenInEstimateStatus_ShouldChangeToApproved()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ-9876", "Revisão geral");

        // Act
        serviceOrder.Approve();

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Aprovado);
    }

    [Fact]
    public void StartMaintenance_WhenNotApproved_ShouldThrowException()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ-9876", "Revisão geral");

        // Act
        Action act = () => serviceOrder.StartMaintenance();

        // Assert
        act.Should().Throw<InvalidOperationException>().WithMessage("Apenas ordens aprovadas podem entrar em manutenção.");
    }
}
