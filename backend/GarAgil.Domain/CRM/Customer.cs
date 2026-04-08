using System;
using System.Text.RegularExpressions;

namespace GarAgil.Domain.CRM;

public class Customer
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Document { get; private set; }
    public string Email { get; private set; }
    public string Phone { get; private set; }
    
    // Endereço (via ViaCEP)
    public string? Cep { get; private set; }
    public string? Street { get; private set; }
    public string? Number { get; private set; }
    public string? Neighborhood { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }

    private readonly System.Collections.Generic.List<Vehicle> _vehicles = new();
    public System.Collections.Generic.IReadOnlyCollection<Vehicle> Vehicles => _vehicles.AsReadOnly();

#pragma warning disable CS8618
    private Customer() { }
#pragma warning restore CS8618

    public Customer(string name, string document, string email, string phone)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome é obrigatório.", nameof(name));
            
        if (!IsValidDocument(document))
            throw new ArgumentException("Documento (CPF/CNPJ) inválido.");

        Id = Guid.NewGuid();
        Name = name;
        Document = document;
        Email = email;
        Phone = phone;
    }

    public void AddVehicle(string plate, string model)
    {
        _vehicles.Add(new Vehicle(plate, model, this.Id));
    }

    public void UpdateAddress(string cep, string street, string number, string neighborhood, string city, string state)
    {
        Cep = cep;
        Street = street;
        Number = number;
        Neighborhood = neighborhood;
        City = city;
        State = state;
    }

    public void UpdateDetails(string name, string document, string email, string phone)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome é obrigatório.");
            
        if (!IsValidDocument(document))
            throw new ArgumentException("Documento (CPF/CNPJ) inválido.");

        Name = name;
        Document = document;
        Email = email;
        Phone = phone;
    }

    public void RemoveVehicle(Guid vehicleId)
    {
        var vehicle = _vehicles.Find(v => v.Id == vehicleId);
        if (vehicle != null)
        {
            _vehicles.Remove(vehicle);
        }
    }

    private bool IsValidDocument(string document)
    {
        // Allows: 
        // 12345678901 (unformatted CPF)
        // 123.456.789-01 (formatted CPF)
        // 12345678000190 (unformatted CNPJ)
        // 12.345.678/0001-90 (formatted CNPJ)
        return Regex.IsMatch(document, @"(^\d{11}$)|(^\d{14}$)|(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)");
    }
}
