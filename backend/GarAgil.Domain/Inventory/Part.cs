using System;

namespace GarAgil.Domain.Inventory;

public class Part
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Sku { get; private set; }
    public decimal CostPrice { get; private set; }
    public decimal SellingPrice { get; private set; }
    public int CurrentStock { get; private set; }

#pragma warning disable CS8618
    private Part() { }
#pragma warning restore CS8618

    public Part(string name, string sku, decimal costPrice, decimal sellingPrice, int initialStock)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome da peça é obrigatório.");

        if (sellingPrice < costPrice)
            throw new ArgumentException("Preço de venda não pode ser menor que o custo.");

        Id = Guid.NewGuid();
        Name = name;
        Sku = sku;
        CostPrice = costPrice;
        SellingPrice = sellingPrice;
        CurrentStock = initialStock;
    }

    public void RemoveStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantidade deve ser maior que zero.");

        if (CurrentStock - quantity < 0)
            throw new InvalidOperationException("Estoque insuficiente.");

        CurrentStock -= quantity;
    }

    public void AddStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantidade deve ser maior que zero.");

        CurrentStock += quantity;
    }

    public void Update(string name, string sku, decimal costPrice, decimal sellingPrice)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome da peça é obrigatório.");

        if (sellingPrice < costPrice)
            throw new ArgumentException("Preço de venda não pode ser menor que o custo.");

        Name = name;
        Sku = sku;
        CostPrice = costPrice;
        SellingPrice = sellingPrice;
    }
}
