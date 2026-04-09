using FluentAssertions;
using GarAgil.Domain.Financial;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Financial;

public class PayableAccountTests
{
    [Fact]
    public void Constructor_WithValidData_ShouldCreatePendingAccount()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));

        account.IsPaid.Should().BeFalse();
        account.PaymentDate.Should().BeNull();
        account.Amount.Should().Be(150.50m);
    }

    [Fact]
    public void Pay_WhenPending_ShouldMarkAsPaid()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));

        account.Pay();

        account.IsPaid.Should().BeTrue();
        account.PaymentDate.Should().NotBeNull();
    }

    [Fact]
    public void Pay_WhenAlreadyPaid_ShouldThrowInvalidOperationException()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));
        account.Pay();

        Action act = () => account.Pay();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void UndoPayment_WhenPaid_ShouldMarkAsPending()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));
        account.Pay();

        account.UndoPayment();

        account.IsPaid.Should().BeFalse();
        account.PaymentDate.Should().BeNull();
    }

    [Fact]
    public void UndoPayment_WhenNotPaid_ShouldThrowInvalidOperationException()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));

        Action act = () => account.UndoPayment();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateProperties()
    {
        var account = new PayableAccount("Luz", 150.50m, DateTime.UtcNow.AddDays(5));
        var newDate = DateTime.UtcNow.AddDays(10);

        account.Update("Água", 200.00m, newDate);

        account.Description.Should().Be("Água");
        account.Amount.Should().Be(200.00m);
        account.DueDate.Should().Be(newDate);
    }
}
