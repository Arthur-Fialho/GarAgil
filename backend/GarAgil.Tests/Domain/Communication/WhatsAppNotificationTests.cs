using FluentAssertions;
using GarAgil.Domain.Communication;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Communication;

public class WhatsAppNotificationTests
{
    [Fact]
    public void Constructor_WhenCreated_ShouldInitializeWithPendingStatus()
    {
        // Arrange
        var customerPhone = "+5531999999999";
        var messageTemplate = "Olá, notamos que a quilometragem do seu Palio indica a necessidade de revisão da correia dentada.";

        // Act
        var notification = new WhatsAppNotification(customerPhone, messageTemplate);

        // Assert
        notification.CustomerPhone.Should().Be(customerPhone);
        notification.Message.Should().Be(messageTemplate);
        notification.Status.Should().Be(NotificationStatus.Pending);
    }

    [Fact]
    public void MarkAsSent_WhenCalled_ShouldChangeStatusToSent()
    {
        // Arrange
        var notification = new WhatsAppNotification("+5511988888888", "Sua revisão está pronta!");

        // Act
        notification.MarkAsSent();

        // Assert
        notification.Status.Should().Be(NotificationStatus.Sent);
        notification.SentAt.Should().NotBeNull();
    }

    [Fact]
    public void MarkAsFailed_WhenCalled_ShouldChangeStatusToFailedAndRecordReason()
    {
        // Arrange
        var notification = new WhatsAppNotification("+5521977777777", "Promoção de troca de óleo!");
        var failReason = "Número inválido ou não possui WhatsApp";

        // Act
        notification.MarkAsFailed(failReason);

        // Assert
        notification.Status.Should().Be(NotificationStatus.Failed);
        notification.FailureReason.Should().Be(failReason);
    }
}
