using System;

namespace GarAgil.Domain.Workflow;

public class ServiceOrder
{
    public Guid Id { get; private set; }
    public string VehiclePlate { get; private set; }
    public string VehicleModel { get; private set; }
    public string Description { get; private set; }
    public ServiceOrderStatus Status { get; private set; }
    public bool IsNfEmitted { get; private set; }
    public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618
    private ServiceOrder() { }
#pragma warning restore CS8618

    public ServiceOrder(string vehiclePlate, string vehicleModel, string description)
    {
        if (string.IsNullOrWhiteSpace(vehiclePlate))
            throw new ArgumentException("Placa do veículo é obrigatória.");

        if (string.IsNullOrWhiteSpace(vehicleModel))
            throw new ArgumentException("Modelo do veículo é obrigatório.");

        Id = Guid.NewGuid();
        VehiclePlate = vehiclePlate;
        VehicleModel = vehicleModel;
        Description = description;
        Status = ServiceOrderStatus.Orcamento;
        IsNfEmitted = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void EmitNf()
    {
        if (Status != ServiceOrderStatus.Pronto)
            throw new InvalidOperationException("A NF só pode ser emitida para veículos prontos.");
            
        IsNfEmitted = true;
    }

    public void SendBudget()
    {
        if (Status != ServiceOrderStatus.Orcamento)
            throw new InvalidOperationException("Apenas ordens em orçamento podem ser enviadas.");
            
        Status = ServiceOrderStatus.OrcamentoEnviado;
    }

    public void Approve()
    {
        if (Status != ServiceOrderStatus.Orcamento && Status != ServiceOrderStatus.OrcamentoEnviado)
            throw new InvalidOperationException("Apenas ordens em orçamento ou orçamento enviado podem ser aprovadas.");
            
        Status = ServiceOrderStatus.Aprovado;
    }

    public void StartMaintenance()
    {
        if (Status != ServiceOrderStatus.Aprovado)
            throw new InvalidOperationException("Apenas ordens aprovadas podem entrar em manutenção.");
            
        Status = ServiceOrderStatus.EmManutencao;
    }

    public void FinishMaintenance()
    {
        if (Status != ServiceOrderStatus.EmManutencao)
            throw new InvalidOperationException("Apenas ordens em manutenção podem ser finalizadas.");
            
        Status = ServiceOrderStatus.Pronto;
    }

    public void FinalizeOrder()
    {
        if (Status != ServiceOrderStatus.Pronto)
            throw new InvalidOperationException("Apenas ordens prontas podem ser entregues/finalizadas.");
            
        Status = ServiceOrderStatus.Finalizado;
    }

    public void CancelOrder()
    {
        if (Status == ServiceOrderStatus.Finalizado)
            throw new InvalidOperationException("Ordens finalizadas não podem ser canceladas.");
            
        Status = ServiceOrderStatus.Cancelado;
    }

    public void UpdateStatus(ServiceOrderStatus newStatus)
    {
        // Simple generic update for Kanban drag-and-drop.
        // In a real scenario, we might want to check strict paths, 
        // but Kanban often allows moving cards freely (e.g., reverting to Aprovado).
        Status = newStatus;
    }
}
