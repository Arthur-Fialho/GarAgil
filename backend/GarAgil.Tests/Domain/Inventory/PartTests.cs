using FluentAssertions;
using GarAgil.Domain.Inventory;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Inventory;

public class PartTests
{
    [Fact]
    public void Constructor_WhenCreated_ShouldInitializeWithProvidedValues()
    {
        // Arrange
        var name = "Filtro de Óleo";
        var sku = "FO-1234";
        var costPrice = 25.50m;
        var sellingPrice = 45.00m;
        var initialStock = 10;

        // Act
        var part = new Part(name, sku, costPrice, sellingPrice, initialStock);

        // Assert
        part.Name.Should().Be(name);
        part.Sku.Should().Be(sku);
        part.CostPrice.Should().Be(costPrice);
        part.SellingPrice.Should().Be(sellingPrice);
        part.CurrentStock.Should().Be(initialStock);
    }

    [Fact]
    public void Constructor_WhenSellingPriceIsLowerThanCostPrice_ShouldThrowException()
    {
        // Arrange
        var name = "Correia Dentada";
        var sku = "CD-987";
        var costPrice = 100.00m;
        var sellingPrice = 90.00m; // Invalid markup
        var initialStock = 5;

        // Act
        Action act = () => new Part(name, sku, costPrice, sellingPrice, initialStock);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("Preço de venda não pode ser menor que o custo.");
    }

    [Fact]
    public void RemoveStock_WhenQuantityIsAvailable_ShouldDecreaseStock()
    {
        // Arrange
        var part = new Part("Bomba D'água", "BD-456", 150.00m, 250.00m, 10);

        // Act
        part.RemoveStock(3);

        // Assert
        part.CurrentStock.Should().Be(7);
    }

    [Fact]
    public void RemoveStock_WhenQuantityExceedsAvailable_ShouldThrowException()
    {
        // Arrange
        var part = new Part("Vela de Ignição", "VI-001", 20.00m, 40.00m, 4);

        // Act
        Action act = () => part.RemoveStock(5);

        // Assert
        act.Should().Throw<InvalidOperationException>().WithMessage("Estoque insuficiente.");
    }
}
