using GarAgil.Domain.Inventory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Application.Inventory;

public class SupplierInvoiceService
{
    private readonly IInvoiceReaderAi _ai;
    private readonly decimal _markupPercentage;

    public SupplierInvoiceService(IInvoiceReaderAi ai, decimal markupPercentage)
    {
        _ai = ai;
        _markupPercentage = markupPercentage;
    }

    public async Task<IEnumerable<Part>> ProcessIncomingInvoiceAsync(byte[] invoiceBytes)
    {
        var parsedItems = await _ai.ParseInvoiceAsync(invoiceBytes);
        var createdParts = new List<Part>();

        foreach (var item in parsedItems)
        {
            // Calculates suggested Selling Price applying the Shop's custom Markup
            var sellingPrice = item.CostPrice + (item.CostPrice * (_markupPercentage / 100));

            var part = new Part(
                name: item.Description, 
                sku: Guid.NewGuid().ToString().Substring(0, 8), 
                costPrice: item.CostPrice, 
                sellingPrice: sellingPrice, 
                initialStock: 1 // Defaults to 1 assuming 1 item read from invoice row
            );

            createdParts.Add(part);
        }

        return createdParts;
    }
}
