using GarAgil.Domain.CRM;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace GarAgil.Infrastructure.Data;

public class BrasilApiGateway : IExternalDataGateway
{
    private readonly HttpClient _httpClient;

    public BrasilApiGateway(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new System.Uri("https://brasilapi.com.br/api/");
    }

    public async Task<AddressDto?> GetAddressByCepAsync(string cep)
    {
        // Removes non-numeric characters
        var cleanCep = new string(System.Linq.Enumerable.ToArray(System.Linq.Enumerable.Where(cep, char.IsDigit)));
        
        if (cleanCep.Length != 8) return null;

        try
        {
            var response = await _httpClient.GetAsync($"cep/v1/{cleanCep}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new System.Exception("Rate limit exceeded on BrasilAPI (429 Too Many Requests). Por favor, aguarde um minuto e tente novamente.");

            if (!response.IsSuccessStatusCode) return null;

            var result = await response.Content.ReadFromJsonAsync<BrasilApiCepResponse>();
            if (result == null) return null;

            return new AddressDto
            {
                Cep = result.Cep,
                Street = result.Street,
                Neighborhood = result.Neighborhood,
                City = result.City,
                State = result.State
            };
        }
        catch
        {
            return null;
        }
    }

    public async Task<CompanyDto?> GetCompanyByCnpjAsync(string cnpj)
    {
        var cleanCnpj = new string(System.Linq.Enumerable.ToArray(System.Linq.Enumerable.Where(cnpj, char.IsDigit)));
        
        if (cleanCnpj.Length != 14) return null;

        try
        {
            var response = await _httpClient.GetAsync($"cnpj/v1/{cleanCnpj}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new System.Exception("Rate limit exceeded on BrasilAPI (429 Too Many Requests). Por favor, aguarde um minuto e tente novamente.");

            if (!response.IsSuccessStatusCode) return null;

            var result = await response.Content.ReadFromJsonAsync<BrasilApiCnpjResponse>(new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (result == null) return null;

            return new CompanyDto
            {
                Document = cnpj,
                LegalName = result.RazaoSocial,
                TradeName = !string.IsNullOrWhiteSpace(result.NomeFantasia) ? result.NomeFantasia : result.RazaoSocial,
                Address = new AddressDto
                {
                    Cep = result.Cep,
                    Street = string.IsNullOrWhiteSpace(result.Numero) ? result.Logradouro : $"{result.Logradouro}, {result.Numero}",
                    Neighborhood = result.Bairro,
                    City = result.Municipio,
                    State = result.Uf
                }
            };
        }
        catch (System.Exception ex)
        {
            System.Console.WriteLine("Error parsing CNPJ: " + ex.Message);
            return null;
        }
    }
}

internal class BrasilApiCepResponse
{
    public string Cep { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
}

internal class BrasilApiCnpjResponse
{
    public string Cnpj { get; set; } = string.Empty;
    
    [JsonPropertyName("razao_social")]
    public string RazaoSocial { get; set; } = string.Empty;
    
    [JsonPropertyName("nome_fantasia")]
    public string? NomeFantasia { get; set; }
    
    public string Cep { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Logradouro { get; set; } = string.Empty;
    public string Numero { get; set; } = string.Empty;
}
