using System;

namespace GarAgil.Domain.CRM;

public class Vehicle
{
    public Guid Id { get; private set; }
    public string Plate { get; private set; }
    public string Model { get; private set; }
    public Guid CustomerId { get; private set; }

#pragma warning disable CS8618
    private Vehicle() { }
#pragma warning restore CS8618

    public Vehicle(string plate, string model)
    {
        if (string.IsNullOrWhiteSpace(plate))
            throw new ArgumentException("Placa do veículo é obrigatória.");
        
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Modelo do veículo é obrigatório.");

        Id = Guid.NewGuid();
        Plate = plate.ToUpper();
        Model = model;
    }

    public void Update(string plate, string model)
    {
        if (string.IsNullOrWhiteSpace(plate))
            throw new ArgumentException("Placa do veículo é obrigatória.");
        
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Modelo do veículo é obrigatório.");

        Plate = plate.ToUpper();
        Model = model;
    }
}
