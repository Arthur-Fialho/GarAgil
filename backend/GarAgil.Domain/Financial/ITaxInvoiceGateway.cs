using System.Threading.Tasks;

namespace GarAgil.Domain.Financial;

/// <summary>
/// Architecture Rule: The backend must never communicate directly with SEFAZ or PBH.
/// All emissions must be routed through this Gateway API interface.
/// </summary>
public interface ITaxInvoiceGateway
{
    Task<string> IssueProductInvoiceAsync(object invoiceData); // Mocking object for NF-e (SEFAZ-MG)
    Task<string> IssueServiceInvoiceAsync(object invoiceData); // Mocking object for NFS-e (PBH)
}
