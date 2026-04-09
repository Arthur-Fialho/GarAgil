using System;

namespace GarAgil.Domain.Financial;

public class PayableAccount
{
    public Guid Id { get; private set; }
    public string Description { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime DueDate { get; private set; }
    public bool IsPaid { get; private set; }
    public DateTime? PaymentDate { get; private set; }

#pragma warning disable CS8618
    private PayableAccount() { }
#pragma warning restore CS8618

    public PayableAccount(string description, decimal amount, DateTime dueDate)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição é obrigatória.");

        if (amount <= 0)
            throw new ArgumentException("O valor da conta deve ser maior que zero.");

        Id = Guid.NewGuid();
        Description = description;
        Amount = amount;
        DueDate = dueDate;
        IsPaid = false;
    }

    public void Pay()
    {
        if (IsPaid)
            throw new InvalidOperationException("Esta conta já foi paga.");

        IsPaid = true;
        PaymentDate = DateTime.UtcNow;
    }

    public void UndoPayment()
    {
        if (!IsPaid)
            throw new InvalidOperationException("Esta conta não está paga.");

        IsPaid = false;
        PaymentDate = null;
    }

    public void Update(string description, decimal amount, DateTime dueDate)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição é obrigatória.");

        if (amount <= 0)
            throw new ArgumentException("O valor da conta deve ser maior que zero.");

        Description = description;
        Amount = amount;
        DueDate = dueDate;
    }
}
