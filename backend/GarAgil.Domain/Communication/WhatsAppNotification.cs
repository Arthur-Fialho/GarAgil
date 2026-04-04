using System;

namespace GarAgil.Domain.Communication;

public class WhatsAppNotification
{
    public Guid Id { get; private set; }
    public string CustomerPhone { get; private set; }
    public string Message { get; private set; }
    public NotificationStatus Status { get; private set; }
    public DateTime? SentAt { get; private set; }
    public string? FailureReason { get; private set; }

    public WhatsAppNotification(string customerPhone, string message)
    {
        if (string.IsNullOrWhiteSpace(customerPhone))
            throw new ArgumentException("O telefone do cliente é obrigatório.");
            
        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("A mensagem é obrigatória.");

        Id = Guid.NewGuid();
        CustomerPhone = customerPhone;
        Message = message;
        Status = NotificationStatus.Pending;
    }

    public void MarkAsSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string reason)
    {
        Status = NotificationStatus.Failed;
        FailureReason = reason;
    }
}
