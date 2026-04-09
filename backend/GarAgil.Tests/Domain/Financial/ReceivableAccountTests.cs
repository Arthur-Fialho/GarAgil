using FluentAssertions;
using GarAgil.Domain.Financial;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Financial;

public class ReceivableAccountTests
{
    [Fact]
    public void Constructor_WithValidData_ShouldCreatePendingAccount()
    {
        var account = new ReceivableAccount("Serviço X", 500.00m, DateTime.UtcNow.AddDays(5));

        account.IsReceived.Should().BeFalse();
        account.ReceivedDate.Should().BeNull();
        account.Amount.Should().Be(500.00m);
    }

    [Fact]
    public void Receive_WhenPending_ShouldMarkAsReceived()
    {
        var account = new ReceivableAccount("Serviço X", 500.00m, DateTime.UtcNow.AddDays(5));

        account.Receive();

        account.IsReceived.Should().BeTrue();
        account.ReceivedDate.Should().NotBeNull();
    }

    [Fact]
    public void Receive_WhenAlreadyReceived_ShouldThrowInvalidOperationException()
    {
        var account = new ReceivableAccount("Serviço X", 500.00m, DateTime.UtcNow.AddDays(5));
        account.Receive();

        Action act = () => account.Receive();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void UndoReceive_WhenReceived_ShouldMarkAsPending()
    {
        var account = new ReceivableAccount("Serviço X", 500.00m, DateTime.UtcNow.AddDays(5));
        account.Receive();

        account.UndoReceive();

        account.IsReceived.Should().BeFalse();
        account.ReceivedDate.Should().BeNull();
    }

    [Fact]
    public void UndoReceive_WhenNotReceived_ShouldThrowInvalidOperationException()
    {
        var account = new ReceivableAccount("Serviço X", 500.00m, DateTime.UtcNow.AddDays(5));

        Action act = () => account.UndoReceive();

        act.Should().Throw<InvalidOperationException>();
    }
}
