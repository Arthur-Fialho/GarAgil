using System.Threading.Tasks;

namespace GarAgil.Domain.CRM;

public class AddressDto
{
    public string Cep { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
}

public class CompanyDto
{
    public string Document { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string TradeName { get; set; } = string.Empty;
    public AddressDto? Address { get; set; }
}

public interface IExternalDataGateway
{
    Task<AddressDto?> GetAddressByCepAsync(string cep);
    Task<CompanyDto?> GetCompanyByCnpjAsync(string cnpj);
}
