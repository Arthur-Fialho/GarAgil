using FluentAssertions;
using GarAgil.Domain.Financial;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Financial;

public class PayableAccountTests
{
    [Fact]
    public void Constructor_WhenCreatedWithValidData_ShouldInitializeCorrectly()
    {
        // Arrange
        var description = "Conta de Luz - CEMIG";
        var amount = 450.00m;
        var dueDate = DateTime.UtcNow.AddDays(10);

        // Act
        var account = new PayableAccount(description, amount, dueDate);

        // Assert
        account.Description.Should().Be(description);
        account.Amount.Should().Be(amount);
        account.DueDate.Should().Be(dueDate);
        account.IsPaid.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WhenAmountIsZeroOrNegative_ShouldThrowException()
    {
        // Arrange
        var description = "Conta de Água - COPASA";
        var amount = -50.00m;
        var dueDate = DateTime.UtcNow.AddDays(5);

        // Act
        Action act = () => new PayableAccount(description, amount, dueDate);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("O valor da conta deve ser maior que zero.");
    }

    [Fact]
    public void Pay_WhenCalled_ShouldSetIsPaidToTrueAndRecordPaymentDate()
    {
        // Arrange
        var account = new PayableAccount("Fornecedor de Peças", 1500.00m, DateTime.UtcNow.AddDays(2));

        // Act
        account.Pay();

        // Assert
        account.IsPaid.Should().BeTrue();
        account.PaymentDate.Should().NotBeNull();
    }

    [Fact]
    public void Pay_WhenAlreadyPaid_ShouldThrowException()
    {
        // Arrange
        var account = new PayableAccount("Aluguel", 2500.00m, DateTime.UtcNow.AddDays(1));
        account.Pay();

        // Act
        Action act = () => account.Pay();

        // Assert
        act.Should().Throw<InvalidOperationException>().WithMessage("Esta conta já foi paga.");
    }
}
