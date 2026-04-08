using System;

namespace GarAgil.Domain.Financial;

public class ReceivableAccount
{
    public Guid Id { get; private set; }
    public string Description { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime DueDate { get; private set; }
    public bool IsReceived { get; private set; }
    public DateTime? ReceivedDate { get; private set; }

#pragma warning disable CS8618
    private ReceivableAccount() { }
#pragma warning restore CS8618

    public ReceivableAccount(string description, decimal amount, DateTime dueDate)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição é obrigatória.");

        if (amount <= 0)
            throw new ArgumentException("O valor deve ser maior que zero.");

        Id = Guid.NewGuid();
        Description = description;
        Amount = amount;
        DueDate = dueDate;
        IsReceived = false;
    }

    public void Receive()
    {
        if (IsReceived)
            throw new InvalidOperationException("Esta conta já foi recebida.");

        IsReceived = true;
        ReceivedDate = DateTime.UtcNow;
    }
}
