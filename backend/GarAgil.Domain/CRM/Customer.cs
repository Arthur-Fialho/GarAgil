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

    public void UpdateAddress(string cep, string street, string number, string neighborhood, string city, string state)
    {
        Cep = cep;
        Street = street;
        Number = number;
        Neighborhood = neighborhood;
        City = city;
        State = state;
    }

    private bool IsValidDocument(string document)
    {
        // Simple regex stub for pt-BR CPF/CNPJ validation to satisfy the current tests
        return Regex.IsMatch(document, @"(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)");
    }
}
