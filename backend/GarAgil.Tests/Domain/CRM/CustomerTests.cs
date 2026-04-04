using FluentAssertions;
using GarAgil.Domain.CRM;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.CRM;

public class CustomerTests
{
    [Fact]
    public void Constructor_WhenCalledWithValidData_ShouldCreateCustomer()
    {
        // Arrange
        var name = "João da Silva";
        var document = "123.456.789-00";
        var email = "joao@email.com";
        var phone = "(11) 98765-4321";

        // Act
        var customer = new Customer(name, document, email, phone);

        // Assert
        customer.Name.Should().Be(name);
        customer.Document.Should().Be(document);
        customer.Email.Should().Be(email);
        customer.Phone.Should().Be(phone);
    }

    [Fact]
    public void Constructor_WhenDocumentIsInvalid_ShouldThrowException()
    {
        // Arrange
        var name = "Empresa Fictícia LTDA";
        var document = "cnpj_invalido";
        var email = "contato@empresa.com";
        var phone = "(31) 3333-3333";

        // Act
        Action act = () => new Customer(name, document, email, phone);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("Documento (CPF/CNPJ) inválido.");
    }
}
