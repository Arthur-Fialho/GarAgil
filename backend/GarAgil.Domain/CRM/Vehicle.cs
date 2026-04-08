using System;
using System.Text.RegularExpressions;

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

    public Vehicle(string plate, string model, Guid customerId)
    {
        if (string.IsNullOrWhiteSpace(plate))
            throw new ArgumentException("Placa do veículo é obrigatória.");
        
        if (!IsValidPlate(plate))
            throw new ArgumentException("Placa do veículo inválida. Use o formato AAA1234 ou AAA1A23.");
        
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Modelo do veículo é obrigatório.");

        Id = Guid.NewGuid();
        Plate = plate.ToUpper();
        Model = model;
        CustomerId = customerId;
    }

    public void Update(string plate, string model)
    {
        if (string.IsNullOrWhiteSpace(plate))
            throw new ArgumentException("Placa do veículo é obrigatória.");

        if (!IsValidPlate(plate))
            throw new ArgumentException("Placa do veículo inválida. Use o formato AAA1234 ou AAA1A23.");

        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Modelo do veículo é obrigatório.");

        Plate = plate.ToUpper();
        Model = model;
    }

    private bool IsValidPlate(string plate)
    {
        // RegEx for Old Brazilian (AAA1234) or Mercosul (AAA1A23)
        return Regex.IsMatch(plate.ToUpper(), @"(^[A-Z]{3}[0-9]{4}$)|(^[A-Z]{3}[0-9][A-Z][0-9]{2}$)");
    }
}
