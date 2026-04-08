using System;

namespace GarAgil.Domain.Workflow;

public class ServiceOrderTask
{
    public Guid Id { get; private set; }
    public string Description { get; private set; }
    public bool IsCompleted { get; private set; }
    public Guid ServiceOrderId { get; private set; }
    public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618
    private ServiceOrderTask() { }
#pragma warning restore CS8618

    public ServiceOrderTask(string description, Guid serviceOrderId, bool isCompleted = false)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição da tarefa é obrigatória.");

        Id = Guid.NewGuid();
        Description = description;
        ServiceOrderId = serviceOrderId;
        IsCompleted = isCompleted;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsCompleted()
    {
        IsCompleted = true;
    }
}
