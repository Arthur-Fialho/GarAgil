using System.Threading.Tasks;

namespace GarAgil.Domain.Inventory;

public class ParsedInvoiceItem
{
    public string Description { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
}

public interface IInvoiceReaderAi
{
    // Simulates parsing a PDF/XML supplier invoice
    Task<System.Collections.Generic.IEnumerable<ParsedInvoiceItem>> ParseInvoiceAsync(byte[] fileBytes);
}
