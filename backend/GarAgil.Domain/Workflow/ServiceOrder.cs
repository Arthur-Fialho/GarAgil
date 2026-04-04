using System;

namespace GarAgil.Domain.Workflow;

public class ServiceOrder
{
    public Guid Id { get; private set; }
    public string VehiclePlate { get; private set; }
    public string Description { get; private set; }
    public ServiceOrderStatus Status { get; private set; }

    public ServiceOrder(string vehiclePlate, string description)
    {
        if (string.IsNullOrWhiteSpace(vehiclePlate))
            throw new ArgumentException("Placa do veículo é obrigatória.");

        Id = Guid.NewGuid();
        VehiclePlate = vehiclePlate;
        Description = description;
        Status = ServiceOrderStatus.Orcamento;
    }

    public void Approve()
    {
        if (Status != ServiceOrderStatus.Orcamento)
            throw new InvalidOperationException("Apenas ordens em orçamento podem ser aprovadas.");
            
        Status = ServiceOrderStatus.Aprovado;
    }

    public void StartMaintenance()
    {
        if (Status != ServiceOrderStatus.Aprovado)
            throw new InvalidOperationException("Apenas ordens aprovadas podem entrar em manutenção.");
            
        Status = ServiceOrderStatus.EmManutencao;
    }
}
