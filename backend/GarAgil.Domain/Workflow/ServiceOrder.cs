using System;
using System.Collections.Generic;
using System.Linq;

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
    public string? MechanicNotes { get; private set; }
    public bool NeedsAdditionalRepair { get; private set; }

    private readonly List<ServiceOrderTask> _tasks = new();
    public IReadOnlyCollection<ServiceOrderTask> Tasks => _tasks.AsReadOnly();

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

        // The initial description is the first task
        _tasks.Add(new ServiceOrderTask(description, Id, isCompleted: false));
    }

    public void AddTask(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("A descrição da tarefa é obrigatória.");
            
        _tasks.Add(new ServiceOrderTask(description, Id, isCompleted: false));
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
            
        // Mark all current pending tasks as completed
        foreach (var task in _tasks.Where(t => !t.IsCompleted))
        {
            task.MarkAsCompleted();
        }

        Status = ServiceOrderStatus.Pronto;
    }

    public void FinishMaintenance(string notes)
    {
        FinishMaintenance();
        MechanicNotes = notes;
        NeedsAdditionalRepair = false;
    }

    public void RequestAdditionalRepair(string notes)
    {
        if (Status != ServiceOrderStatus.EmManutencao)
            throw new InvalidOperationException("Apenas ordens em manutenção podem solicitar reparos adicionais.");

        // Mark current tasks as completed before closing this OS to open a new one
        foreach (var task in _tasks.Where(t => !t.IsCompleted))
        {
            task.MarkAsCompleted();
        }

        MechanicNotes = notes;
        NeedsAdditionalRepair = true;
    }

    public void FinalizeOrder()
    {
        if (Status != ServiceOrderStatus.Pronto)
            throw new InvalidOperationException("Apenas ordens prontas podem ser entregues/finalizadas.");
            
        if (!IsNfEmitted)
            throw new InvalidOperationException("Não é possível finalizar sem antes emitir a Nota Fiscal.");

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
        Status = newStatus;
    }
}
