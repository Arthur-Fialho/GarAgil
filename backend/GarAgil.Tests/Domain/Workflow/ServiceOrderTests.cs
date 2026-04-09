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
        var vehiclePlate = "ABC1234";
        var vehicleModel = "Palio 1.0";
        var description = "Troca de óleo e filtro";

        // Act
        var serviceOrder = new ServiceOrder(vehiclePlate, vehicleModel, description);

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Orcamento);
        serviceOrder.VehicleModel.Should().Be(vehicleModel);
        serviceOrder.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SendBudget_WhenInEstimateStatus_ShouldChangeToOrcamentoEnviado()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");

        // Act
        serviceOrder.SendBudget();

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.OrcamentoEnviado);
    }

    [Fact]
    public void Approve_WhenInEstimateStatus_ShouldChangeToApproved()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");

        // Act
        serviceOrder.Approve();

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Aprovado);
    }

    [Fact]
    public void StartMaintenance_WhenNotApproved_ShouldThrowException()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");

        // Act
        Action act = () => serviceOrder.StartMaintenance();

        // Assert
        act.Should().Throw<InvalidOperationException>().WithMessage("Apenas ordens aprovadas podem entrar em manutenção.");
    }

    [Fact]
    public void FinalizeOrder_WhenInProntoStatus_ShouldChangeToFinalizado()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");
        serviceOrder.Approve();
        serviceOrder.StartMaintenance();
        serviceOrder.FinishMaintenance(); // Changes to Pronto
        serviceOrder.EmitNf(); // Emit NF before finalizing

        // Act
        serviceOrder.FinalizeOrder();

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Finalizado);
    }

    [Fact]
    public void CancelOrder_WhenCalled_ShouldChangeToCancelado()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");

        // Act
        serviceOrder.CancelOrder();

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.Cancelado);
    }

    [Fact]
    public void CancelOrder_WhenAlreadyFinalizado_ShouldThrowException()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");
        serviceOrder.Approve();
        serviceOrder.StartMaintenance();
        serviceOrder.FinishMaintenance();
        serviceOrder.EmitNf();
        serviceOrder.FinalizeOrder();

        // Act
        Action act = () => serviceOrder.CancelOrder();

        // Assert
        act.Should().Throw<InvalidOperationException>().WithMessage("Ordens finalizadas não podem ser canceladas.");
    }

    [Fact]
    public void RequestAdditionalRepair_WhenCalled_ShouldKeepEmManutencaoStatus()
    {
        // Arrange
        var serviceOrder = new ServiceOrder("XYZ9876", "Gol 1.0", "Revisão geral");
        serviceOrder.Approve();
        serviceOrder.StartMaintenance();

        // Act
        serviceOrder.RequestAdditionalRepair("Novo problema no motor");

        // Assert
        serviceOrder.Status.Should().Be(ServiceOrderStatus.EmManutencao);
        serviceOrder.NeedsAdditionalRepair.Should().BeTrue();
        serviceOrder.MechanicNotes.Should().Be("Novo problema no motor");
    }
}
