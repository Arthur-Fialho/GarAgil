using FluentAssertions;
using GarAgil.Domain.Inventory;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Inventory;

public class PartTests
{
    [Fact]
    public void Constructor_WithValidData_ShouldCreatePart()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 5);

        part.Name.Should().Be("Filtro");
        part.Sku.Should().Be("FO-123");
        part.CostPrice.Should().Be(10.0m);
        part.SellingPrice.Should().Be(20.0m);
        part.CurrentStock.Should().Be(5);
    }

    [Fact]
    public void Constructor_WithInvalidMargin_ShouldThrowArgumentException()
    {
        Action act = () => new Part("Filtro", "FO-123", 20.0m, 10.0m, 5);

        act.Should().Throw<ArgumentException>().WithMessage("Preço de venda não pode ser menor que o custo.");
    }

    [Fact]
    public void AddStock_WithValidQuantity_ShouldIncreaseStock()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 5);

        part.AddStock(10);

        part.CurrentStock.Should().Be(15);
    }

    [Fact]
    public void AddStock_WithNegativeQuantity_ShouldThrowArgumentException()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 5);

        Action act = () => part.AddStock(-5);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void RemoveStock_WithValidQuantity_ShouldDecreaseStock()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 15);

        part.RemoveStock(5);

        part.CurrentStock.Should().Be(10);
    }

    [Fact]
    public void RemoveStock_WithInsufficientStock_ShouldThrowInvalidOperationException()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 5);

        Action act = () => part.RemoveStock(10);

        act.Should().Throw<InvalidOperationException>().WithMessage("Estoque insuficiente.");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdatePricesAndName()
    {
        var part = new Part("Filtro", "FO-123", 10.0m, 20.0m, 5);

        part.Update("Filtro Premium", "FO-123", 15.0m, 30.0m);

        part.Name.Should().Be("Filtro Premium");
        part.CostPrice.Should().Be(15.0m);
        part.SellingPrice.Should().Be(30.0m);
    }
}
